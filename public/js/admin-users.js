document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tableContainer = document.getElementById('table-container');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById('search-input');
    const modal = document.getElementById('user-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const userForm = document.getElementById('user-form');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const rolesContainer = document.getElementById('roles-checkbox-container');
    const userNameDisplay = document.getElementById('user-name-display');

    // State
    let allUsers = [];
    let filteredUsers = [];
    let allRoles = [];
    let currentPage = 1;
    const rowsPerPage = 10;

    // Modal Management
    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => {
        modal.classList.add('hidden');
        userForm.reset();
        document.getElementById('user-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };

    // Data Filtering and Rendering
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredUsers = allUsers.filter(user => {
            const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.toLowerCase();
            const userName = user.UserName.toLowerCase();
            const email = user.Email.toLowerCase();
            return fullName.includes(searchTerm) || userName.includes(searchTerm) || email.includes(searchTerm);
        });
        renderPage(1);
    };

    const renderTable = () => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedUsers = filteredUsers.slice(start, end);

        if (paginatedUsers.length === 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No se encontraron usuarios.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${paginatedUsers.map(user => `
                    <tr data-id="${user.UserID}">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${user.FirstName || ''} ${user.LastName || ''}</div>
                            <div class="text-sm text-gray-500">${user.UserName}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.Email}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${user.user_role.map(ur => `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">${ur.role.RoleName}</span>`).join(' ') || 'Sin rol'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button class="text-primary hover:text-primary-focus edit-button" data-user='${JSON.stringify(user)}'>Editar Roles</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };

    const renderPagination = () => {
        const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);
        const startRecord = filteredUsers.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
        const endRecord = Math.min(currentPage * rowsPerPage, filteredUsers.length);
        paginationContainer.innerHTML = pageCount <= 1 ? '' : `
            <div class="text-sm text-gray-700">Mostrando ${startRecord} a ${endRecord} de ${filteredUsers.length} resultados</div>
            <div class="flex items-center space-x-1">
                <button class="px-3 py-1 border rounded-md text-sm prev-btn" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                <button class="px-3 py-1 border rounded-md text-sm next-btn" ${currentPage === pageCount ? 'disabled' : ''}>Siguiente</button>
            </div>
        `;
    };

    const renderPage = (page) => {
        currentPage = page;
        renderTable();
        renderPagination();
    };
    
    const populateRolesCheckboxes = (userRoles = []) => {
        rolesContainer.innerHTML = allRoles.map(role => `
            <div class="flex items-center">
                <input id="role-${role.RoleID}" name="roleIds" value="${role.RoleID}" type="checkbox" ${userRoles.includes(role.RoleID) ? 'checked' : ''} class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                <label for="role-${role.RoleID}" class="ml-2 block text-sm text-gray-900">${role.RoleName}</label>
            </div>
        `).join('');
    };

    const fetchInitialData = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const [usersRes, rolesRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/roles'),
            ]);

            if (!usersRes.ok || !rolesRes.ok) throw new Error('Failed to fetch initial data');

            allUsers = await usersRes.json();
            allRoles = (await rolesRes.json()).map(r => ({ RoleID: r.RoleID, RoleName: r.RoleName }));
            
            applyFilters();
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los datos.</p>`;
            console.error('Error fetching data:', error);
        }
    };

    // Event Listeners
    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const userId = document.getElementById('user-id').value;
        const selectedRoleIds = Array.from(document.querySelectorAll('input[name="roleIds"]:checked')).map(cb => parseInt(cb.value));

        try {
            const response = await fetch(`/api/admin/users/${userId}/roles`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roleIds: selectedRoleIds }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update roles');
            }
            
            closeModal();
            await fetchInitialData(); // Refetch all data to see changes
        } catch (error) {
            formError.textContent = error.message;
            formError.classList.remove('hidden');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Guardar Cambios';
        }
    });

    tableContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-button')) {
            const user = JSON.parse(e.target.dataset.user);
            document.getElementById('user-id').value = user.UserID;
            userNameDisplay.textContent = `${user.FirstName || ''} ${user.LastName || ''} (${user.UserName})`;
            
            const userRoleIds = user.user_role.map(ur => ur.RoleID);
            populateRolesCheckboxes(userRoleIds);

            openModal();
        }
    });

    searchInput.addEventListener('input', applyFilters);

    paginationContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('prev-btn')) {
            if (currentPage > 1) renderPage(currentPage - 1);
        }
        if (target.classList.contains('next-btn')) {
            const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);
            if (currentPage < pageCount) renderPage(currentPage + 1);
        }
    });

    fetchInitialData();
});