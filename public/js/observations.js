document.addEventListener('DOMContentLoaded', () => {
    const observationsContainer = document.getElementById('observations-container');
    const modal = document.getElementById('observation-modal');
    const addButton = document.getElementById('add-observation-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const observationForm = document.getElementById('observation-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const studentSelect = document.getElementById('StudentID');

    let allStudents = [];

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        observationForm.reset();
        document.getElementById('observation-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };

    const renderObservations = (observations) => {
        if (!observations.length) {
            observationsContainer.innerHTML = `<div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">No hay observaciones registradas.</div>`;
            return;
        }

        observationsContainer.innerHTML = observations.map(obs => `
            <div class="bg-white rounded-lg shadow-md p-5">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-lg text-gray-800">${obs.student?.FirstName || ''} ${obs.student?.LastName || ''}</p>
                        <p class="text-sm text-gray-500">
                            <span class="font-medium">${obs.Category || 'General'}</span> - ${new Date(obs.ObservationDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="flex items-center space-x-3">
                        ${obs.IsPositive ? '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Positiva</span>' : ''}
                        ${obs.RequiresAction ? '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Requiere Acción</span>' : ''}
                        <button class="text-primary hover:text-primary-focus text-sm edit-button" data-observation='${JSON.stringify(obs)}'>Editar</button>
                        <button class="text-error hover:text-red-700 text-sm delete-button" data-id="${obs.ObservationID}">Eliminar</button>
                    </div>
                </div>
                <p class="text-gray-700 mt-3">${obs.Observation}</p>
                ${obs.ActionTaken ? `<div class="mt-3 pt-3 border-t"><p class="text-sm text-gray-600"><span class="font-semibold">Acción Tomada:</span> ${obs.ActionTaken}</p></div>` : ''}
                <div class="text-right text-xs text-gray-400 mt-3">
                    Registrado por: ${obs.employee?.FirstName || ''} ${obs.employee?.LastName || 'N/A'}
                </div>
            </div>
        `).join('');
    };
    
    const fetchInitialData = async () => {
        try {
            observationsContainer.innerHTML = '<div class="bg-white rounded-lg shadow p-6 text-center">Cargando...</div>';
            const [obsRes, studentsRes] = await Promise.all([
                fetch('/api/observations'),
                fetch('/api/students'),
            ]);

            if (!obsRes.ok || !studentsRes.ok) throw new Error('Failed to fetch initial data');
            
            const observations = await obsRes.json();
            allStudents = await studentsRes.json();
            
            // Populate student dropdown
            studentSelect.innerHTML = '<option value="">Seleccione un estudiante</option>' + allStudents
                .filter(s => s.IsActive)
                .map(s => `<option value="${s.StudentID}">${s.FirstName} ${s.LastName}</option>`).join('');

            renderObservations(observations);
        } catch (error) {
            observationsContainer.innerHTML = `<div class="bg-white rounded-lg shadow p-6 text-center text-red-500">Error al cargar las observaciones.</div>`;
            console.error('Error fetching data:', error);
        }
    };

    addButton.addEventListener('click', () => {
        openModal('Añadir Nueva Observación');
        document.getElementById('ObservationDate').value = new Date().toISOString().split('T')[0];
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    observationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(observationForm);
        const observationId = formData.get('ObservationID');
        const observationData = {
            StudentID: parseInt(formData.get('StudentID')),
            ObservationDate: formData.get('ObservationDate'),
            Category: formData.get('Category'),
            Observation: formData.get('Observation'),
            ActionTaken: formData.get('ActionTaken'),
            IsPositive: document.getElementById('IsPositive').checked ? 1 : 0,
            RequiresAction: document.getElementById('RequiresAction').checked ? 1 : 0,
            IsPrivate: document.getElementById('IsPrivate').checked ? 1 : 0,
        };

        const method = observationId ? 'PUT' : 'POST';
        const url = observationId ? `/api/observations/${observationId}` : '/api/observations';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(observationData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save observation');
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

    observationsContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-button')) {
            const obs = JSON.parse(target.dataset.observation);
            openModal('Editar Observación');
            document.getElementById('observation-id').value = obs.ObservationID;
            document.getElementById('StudentID').value = obs.StudentID;
            document.getElementById('ObservationDate').value = obs.ObservationDate.split('T')[0];
            document.getElementById('Category').value = obs.Category || '';
            document.getElementById('Observation').value = obs.Observation || '';
            document.getElementById('ActionTaken').value = obs.ActionTaken || '';
            document.getElementById('IsPositive').checked = obs.IsPositive === 1;
            document.getElementById('RequiresAction').checked = obs.RequiresAction === 1;
            document.getElementById('IsPrivate').checked = obs.IsPrivate === 1;
        }

        if (target.classList.contains('delete-button')) {
            const observationId = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar esta observación?')) {
                fetch(`/api/observations/${observationId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            fetchInitialData();
                        } else {
                            alert('Error al eliminar la observación.');
                        }
                    });
            }
        }
    });

    // Initial fetch
    fetchInitialData();
});