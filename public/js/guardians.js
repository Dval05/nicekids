document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const modal = document.getElementById('guardian-modal');
    const addGuardianButton = document.getElementById('add-guardian-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const guardianForm = document.getElementById('guardian-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        guardianForm.reset();
        document.getElementById('guardian-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };

    const renderTable = (guardians) => {
        if (!guardians.length) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay responsables registrados.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${guardians.map(guardian => `
                    <tr data-id="${guardian.GuardianID}">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${guardian.FirstName} ${guardian.LastName}</div>
                            <div class="text-sm text-gray-500">${guardian.DocumentNumber || 'Sin cédula'}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${guardian.user?.UserName || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${guardian.Relationship}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>${guardian.PhoneNumber || ''}</div>
                            <div>${guardian.Email || ''}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button class="text-primary hover:text-primary-focus edit-button" data-guardian='${JSON.stringify(guardian)}'>Editar</button>
                            <button class="text-error hover:text-red-700 delete-button" data-id="${guardian.GuardianID}">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };
    
    const fetchGuardians = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const response = await fetch('/api/guardians');
            if (!response.ok) throw new Error('Network response was not ok');
            const guardians = await response.json();
            renderTable(guardians);
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los responsables.</p>`;
            console.error('Error fetching guardians:', error);
        }
    };

    addGuardianButton.addEventListener('click', () => {
        openModal('Añadir Nuevo Responsable');
        document.getElementById('IsAuthorizedPickup').checked = true;
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    guardianForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(guardianForm);
        const guardianId = formData.get('GuardianID');
        const guardianData = {
            FirstName: formData.get('FirstName'),
            LastName: formData.get('LastName'),
            DocumentNumber: formData.get('DocumentNumber'),
            Relationship: formData.get('Relationship'),
            PhoneNumber: formData.get('PhoneNumber'),
            Email: formData.get('Email'),
            Address: formData.get('Address'),
            Occupation: formData.get('Occupation'),
            WorkPhone: formData.get('WorkPhone'),
            IsEmergencyContact: document.getElementById('IsEmergencyContact').checked ? 1 : 0,
            IsAuthorizedPickup: document.getElementById('IsAuthorizedPickup').checked ? 1 : 0,
        };

        const method = guardianId ? 'PUT' : 'POST';
        const url = guardianId ? `/api/guardians/${guardianId}` : '/api/guardians';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guardianData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save guardian');
            }
            
            closeModal();
            fetchGuardians();
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
            const guardian = JSON.parse(target.dataset.guardian);
            openModal('Editar Responsable');
            document.getElementById('guardian-id').value = guardian.GuardianID;
            for (const key in guardian) {
                const input = document.getElementById(key);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = guardian[key] === 1;
                    } else {
                        input.value = guardian[key] || '';
                    }
                }
            }
        }

        if (target.classList.contains('delete-button')) {
            const guardianId = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar a este responsable? Esta acción es permanente y no se puede deshacer.')) {
                fetch(`/api/guardians/${guardianId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            fetchGuardians();
                        } else {
                            alert('Error al eliminar el responsable.');
                        }
                    });
            }
        }
    });

    // Initial fetch
    fetchGuardians();
});