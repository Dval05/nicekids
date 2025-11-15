document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const modal = document.getElementById('grade-modal');
    const addGradeButton = document.getElementById('add-grade-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const gradeForm = document.getElementById('grade-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        gradeForm.reset();
        document.getElementById('grade-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };

    const renderTable = (grades) => {
        if (!grades.length) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay grados registrados.</p>`;
            return;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rango de Edad</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${grades.map(grade => `
                    <tr data-id="${grade.GradeID}">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${grade.GradeName}</div>
                            <div class="text-sm text-gray-500">${grade.Description || ''}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.MaxCapacity || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${grade.AgeRangeMin || '?'} - ${grade.AgeRangeMax || '?'} años</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${grade.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${grade.IsActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button class="text-primary hover:text-primary-focus edit-button" data-grade='${JSON.stringify(grade)}'>Editar</button>
                            <button class="text-error hover:text-red-700 delete-button" data-id="${grade.GradeID}">Desactivar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };
    
    const fetchGrades = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const response = await fetch('/api/grades');
            if (!response.ok) throw new Error('Network response was not ok');
            const grades = await response.json();
            renderTable(grades);
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los grados.</p>`;
            console.error('Error fetching grades:', error);
        }
    };

    addGradeButton.addEventListener('click', () => {
        openModal('Añadir Nuevo Grado');
        document.getElementById('IsActive').checked = true;
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    gradeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(gradeForm);
        const gradeId = formData.get('GradeID');
        const gradeData = {
            GradeName: formData.get('GradeName'),
            Description: formData.get('Description'),
            AgeRangeMin: formData.get('AgeRangeMin') ? parseInt(formData.get('AgeRangeMin')) : null,
            AgeRangeMax: formData.get('AgeRangeMax') ? parseInt(formData.get('AgeRangeMax')) : null,
            MaxCapacity: formData.get('MaxCapacity') ? parseInt(formData.get('MaxCapacity')) : null,
            IsActive: document.getElementById('IsActive').checked ? 1 : 0,
        };

        const method = gradeId ? 'PUT' : 'POST';
        const url = gradeId ? `/api/grades/${gradeId}` : '/api/grades';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save grade');
            }
            
            closeModal();
            fetchGrades();
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
            const grade = JSON.parse(target.dataset.grade);
            openModal('Editar Grado');
            document.getElementById('grade-id').value = grade.GradeID;
            document.getElementById('GradeName').value = grade.GradeName;
            document.getElementById('Description').value = grade.Description || '';
            document.getElementById('AgeRangeMin').value = grade.AgeRangeMin || '';
            document.getElementById('AgeRangeMax').value = grade.AgeRangeMax || '';
            document.getElementById('MaxCapacity').value = grade.MaxCapacity || '';
            document.getElementById('IsActive').checked = grade.IsActive === 1;
        }

        if (target.classList.contains('delete-button')) {
            const gradeId = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres desactivar este grado?')) {
                fetch(`/api/grades/${gradeId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            fetchGrades();
                        } else {
                            alert('Error al desactivar el grado.');
                        }
                    });
            }
        }
    });

    // Initial fetch
    fetchGrades();
});