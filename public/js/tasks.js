document.addEventListener('DOMContentLoaded', () => {
    const taskBoard = document.getElementById('tasks-board');
    const modal = document.getElementById('task-modal');
    const addButton = document.getElementById('add-task-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const employeeSelect = document.getElementById('EmpID');

    let allEmployees = [];

    const priorityColors = {
        'Low': 'border-l-4 border-blue-400',
        'Medium': 'border-l-4 border-yellow-400',
        'High': 'border-l-4 border-orange-500',
        'Urgent': 'border-l-4 border-red-500',
    };

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        taskForm.reset();
        document.getElementById('task-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };

    const renderTasks = (tasks) => {
        const columns = {
            'Pending': document.getElementById('pending-tasks'),
            'In Progress': document.getElementById('inprogress-tasks'),
            'Completed': document.getElementById('completed-tasks'),
            'On Hold': document.getElementById('pending-tasks') // On Hold tasks also go to Pending column
        };

        // Clear existing tasks
        Object.values(columns).forEach(col => col.innerHTML = '');

        if (!tasks.length) {
            columns['Pending'].innerHTML = '<p class="text-sm text-gray-500 p-2">No hay tareas pendientes.</p>';
            return;
        }

        tasks.forEach(task => {
            const column = columns[task.Status] || columns['Pending'];
            const card = document.createElement('div');
            card.className = `bg-white rounded-md shadow p-4 space-y-2 ${priorityColors[task.Priority] || 'border-l-4 border-gray-300'}`;
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <p class="font-bold text-gray-800">${task.TaskName}</p>
                    <div class="flex-shrink-0 space-x-2">
                        <button class="text-xs text-primary hover:text-primary-focus edit-button" data-task='${JSON.stringify(task)}'>✏️</button>
                        <button class="text-xs text-error hover:text-red-700 delete-button" data-id="${task.TaskID}">🗑️</button>
                    </div>
                </div>
                <p class="text-sm text-gray-600">${task.Description || ''}</p>
                <div class="text-xs text-gray-500 pt-2 border-t">
                    <p>Asignado a: <span class="font-medium">${task.employee?.FirstName || 'N/A'} ${task.employee?.LastName || ''}</span></p>
                    ${task.DueDate ? `<p>Vence: ${new Date(task.DueDate).toLocaleDateString()}</p>` : ''}
                </div>
            `;
            column.appendChild(card);
        });
    };
    
    const fetchInitialData = async () => {
        try {
            if (taskBoard) {
                 taskBoard.querySelector('#pending-tasks').innerHTML = '<p class="text-sm text-gray-500 p-2">Cargando...</p>';
            }
            const [tasksRes, employeesRes] = await Promise.all([
                fetch('/api/tasks'),
                fetch('/api/employees'),
            ]);

            if (!tasksRes.ok || !employeesRes.ok) throw new Error('Failed to fetch initial data');
            
            const tasks = await tasksRes.json();
            allEmployees = await employeesRes.json();
            
            employeeSelect.innerHTML = '<option value="">Seleccione un empleado</option>' + allEmployees
                .filter(e => e.IsActive)
                .map(e => `<option value="${e.EmpID}">${e.FirstName} ${e.LastName}</option>`).join('');

            renderTasks(tasks);
        } catch (error) {
            if (taskBoard) {
                taskBoard.querySelector('#pending-tasks').innerHTML = `<p class="text-sm text-red-500 p-2">Error al cargar las tareas.</p>`;
            }
            console.error('Error fetching data:', error);
        }
    };

    addButton.addEventListener('click', () => {
        openModal('Añadir Nueva Tarea');
        document.getElementById('Status').value = 'Pending';
        document.getElementById('Priority').value = 'Medium';
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(taskForm);
        const taskId = formData.get('TaskID');
        const taskData = {
            TaskName: formData.get('TaskName'),
            Description: formData.get('Description'),
            EmpID: parseInt(formData.get('EmpID')),
            DueDate: formData.get('DueDate') || null,
            Priority: formData.get('Priority'),
            Status: formData.get('Status'),
        };

        const method = taskId ? 'PUT' : 'POST';
        const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save task');
            }
            
            closeModal();
            fetchInitialData();
        } catch (error) {
            formError.textContent = error.message;
            formError.classList.remove('hidden');
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Guardar';
        }
    });

    taskBoard.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-button');
        const deleteButton = e.target.closest('.delete-button');

        if (editButton) {
            const task = JSON.parse(editButton.dataset.task);
            openModal('Editar Tarea');
            document.getElementById('task-id').value = task.TaskID;
            document.getElementById('TaskName').value = task.TaskName;
            document.getElementById('Description').value = task.Description || '';
            document.getElementById('EmpID').value = task.EmpID;
            document.getElementById('DueDate').value = task.DueDate ? task.DueDate.split('T')[0] : '';
            document.getElementById('Priority').value = task.Priority;
            document.getElementById('Status').value = task.Status;
        }

        if (deleteButton) {
            const taskId = deleteButton.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            fetchInitialData();
                        } else {
                            alert('Error al eliminar la tarea.');
                        }
                    });
            }
        }
    });

    // Initial fetch
    fetchInitialData();
});