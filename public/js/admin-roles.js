document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const modal = document.getElementById('role-modal');
    const addRoleButton = document.getElementById('add-role-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const roleForm = document.getElementById('role-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const permissionsContainer = document.getElementById('permissions-container');

    let allPermissions = {};

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        roleForm.reset();
        document.getElementById('role-id').value = '';
        formError.classList.add('hidden');
    };
    
    const renderTable = (roles) => {
        if (!roles.length) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay roles definidos.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${roles.map(role => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${role.RoleName}</div>
                            <div class="text-sm text-gray-500">${role.Description || ''}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                           <span class="font-semibold">${role.role_permission.length}</span> permisos asignados
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button class="text-primary hover:text-primary-focus edit-button" data-role='${JSON.stringify(role)}'>Editar</button>
                            <button class="text-error hover:text-red-700 delete-button" data-id="${role.RoleID}">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };

    const populatePermissionsCheckboxes = (rolePermissions = []) => {
        permissionsContainer.innerHTML = Object.entries(allPermissions).map(([module, permissions]) => `
            <div class="mb-3">
                <h4 class="font-semibold text-gray-700 text-sm mb-2 pb-1 border-b">${module}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    ${permissions.map(perm => `
                        <div class="flex items-center">
                            <input id="perm-${perm.PermissionID}" name="permissionIds" value="${perm.PermissionID}" type="checkbox" ${rolePermissions.includes(perm.PermissionID) ? 'checked' : ''} class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="perm-${perm.PermissionID}" class="ml-2 block text-sm text-gray-900" title="${perm.Description || ''}">${perm.PermissionName}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    };

    const fetchInitialData = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const [rolesRes, permsRes] = await Promise.all([
                fetch('/api/admin/roles'),
                fetch('/api/admin/permissions'),
            ]);

            if (!rolesRes.ok || !permsRes.ok) throw new Error('Failed to fetch initial data');
            
            const roles = await rolesRes.json();
            allPermissions = await permsRes.json();

            renderTable(roles);
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los datos.</p>`;
        }
    };

    addRoleButton.addEventListener('click', () => {
        populatePermissionsCheckboxes();
        openModal('Añadir Nuevo Rol');
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    roleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const roleId = document.getElementById('role-id').value;
        const roleData = {
            RoleName: document.getElementById('RoleName').value,
            Description: document.getElementById('Description').value,
            permissionIds: Array.from(document.querySelectorAll('input[name="permissionIds"]:checked')).map(cb => parseInt(cb.value)),
        };

        const method = roleId ? 'PUT' : 'POST';
        const url = roleId ? `/api/admin/roles/${roleId}` : '/api/admin/roles';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save role');
            }
            
            closeModal();
            fetchInitialData();
        } catch (error) {
            formError.textContent = error.message;
            formError.classList.remove('hidden');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Guardar Rol';
        }
    });

    tableContainer.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.classList.contains('edit-button')) {
            const role = JSON.parse(target.dataset.role);
            openModal('Editar Rol');
            document.getElementById('role-id').value = role.RoleID;
            document.getElementById('RoleName').value = role.RoleName;
            document.getElementById('Description').value = role.Description || '';
            const rolePermissionIds = role.role_permission.map(rp => rp.PermissionID);
            populatePermissionsCheckboxes(rolePermissionIds);
        }

        if (target.classList.contains('delete-button')) {
            const roleId = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar este rol? Esta acción no se puede deshacer.')) {
                try {
                    const response = await fetch(`/api/admin/roles/${roleId}`, { method: 'DELETE' });
                    if (response.ok) {
                        fetchInitialData();
                    } else {
                        const error = await response.json();
                        alert(`Error al eliminar el rol: ${error.message}`);
                    }
                } catch (err) {
                     alert(`Error de red al eliminar el rol.`);
                }
            }
        }
    });

    fetchInitialData();
});
