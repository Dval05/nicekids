document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const modal = document.getElementById('employee-modal');
    const addEmployeeButton = document.getElementById('add-employee-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const employeeForm = document.getElementById('employee-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        employeeForm.reset();
        document.getElementById('employee-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };

    const renderTable = (employees) => {
        if (!employees.length) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay empleados registrados.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${employees.map(employee => `
                    <tr data-id="${employee.EmpID}">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${employee.FirstName} ${employee.LastName}</div>
                        </td>
                         <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.user?.UserName || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.Position || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.Email || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${employee.IsActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button class="text-primary hover:text-primary-focus edit-button" data-employee='${JSON.stringify(employee)}'>Editar</button>
                            <button class="text-error hover:text-red-700 delete-button" data-id="${employee.EmpID}">Desactivar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };
    
    const fetchEmployees = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const response = await fetch('/api/employees');
            if (!response.ok) throw new Error('Network response was not ok');
            const employees = await response.json();
            renderTable(employees);
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los empleados.</p>`;
            console.error('Error fetching employees:', error);
        }
    };

    addEmployeeButton.addEventListener('click', () => {
        openModal('Añadir Nuevo Empleado');
        document.getElementById('IsActive').checked = true;
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    employeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(employeeForm);
        const employeeId = formData.get('EmpID');
        const employeeData = {
            FirstName: formData.get('FirstName'),
            LastName: formData.get('LastName'),
            DocumentNumber: formData.get('DocumentNumber'),
            Position: formData.get('Position'),
            Email: formData.get('Email'),
            PhoneNumber: formData.get('PhoneNumber'),
            HireDate: formData.get('HireDate') || null,
            IsActive: document.getElementById('IsActive').checked ? 1 : 0,
        };

        const method = employeeId ? 'PUT' : 'POST';
        const url = employeeId ? `/api/employees/${employeeId}` : '/api/employees';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(employeeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save employee');
            }
            
            closeModal();
            fetchEmployees();
        } catch (error) {
            formError.textContent = error.message;
            formError.classList.remove('hidden');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Guardar';
        }
    });

    tableContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-button')) {
            const employee = JSON.parse(target.dataset.employee);
            openModal('Editar Empleado');
            document.getElementById('employee-id').value = employee.EmpID;
            document.getElementById('FirstName').value = employee.FirstName;
            document.getElementById('LastName').value = employee.LastName;
            document.getElementById('DocumentNumber').value = employee.DocumentNumber || '';
            document.getElementById('Position').value = employee.Position || '';
            document.getElementById('Email').value = employee.Email || '';
            document.getElementById('PhoneNumber').value = employee.PhoneNumber || '';
            document.getElementById('HireDate').value = employee.HireDate ? employee.HireDate.split('T')[0] : '';
            document.getElementById('IsActive').checked = employee.IsActive === 1;
        }

        if (target.classList.contains('delete-button')) {
            const employeeId = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres desactivar a este empleado?')) {
                fetch(`/api/employees/${employeeId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            fetchEmployees();
                        } else {
                            alert('Error al desactivar el empleado.');
                        }
                    });
            }
        }
    });

    // Initial fetch
    fetchEmployees();
});