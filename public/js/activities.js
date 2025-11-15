document.addEventListener('DOMContentLoaded', () => {
    const activitiesContainer = document.getElementById('activities-container');
    const addActivityButton = document.getElementById('add-activity-button');

    // Modal elements
    const modal = document.getElementById('activity-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const deleteButton = document.getElementById('delete-button');
    const activityForm = document.getElementById('activity-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const gradeSelect = document.getElementById('GradeID');
    const employeeSelect = document.getElementById('EmpID');
    const multimediaSection = document.getElementById('multimedia-section');
    const mediaGallery = document.getElementById('media-gallery');
    const mediaUpload = document.getElementById('media-upload');
    const uploadProgress = document.getElementById('upload-progress');

    let allGrades = [];
    let allEmployees = [];
    let currentActivities = [];

    const statusInfo = {
        'Planned': { text: 'Planeado', class: 'bg-blue-100 text-blue-800' },
        'Ongoing': { text: 'En Curso', class: 'bg-yellow-100 text-yellow-800' },
        'Completed': { text: 'Completado', class: 'bg-green-100 text-green-800' },
        'Cancelled': { text: 'Cancelado', class: 'bg-red-100 text-red-800' }
    };

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        activityForm.reset();
        document.getElementById('activity-id').value = '';
        deleteButton.classList.add('hidden');
        multimediaSection.classList.add('hidden');
        mediaGallery.innerHTML = '';
        formError.classList.add('hidden');
    };

    const renderActivitiesList = (activities) => {
        if (!activities.length) {
            activitiesContainer.innerHTML = `<div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">No hay actividades planificadas.</div>`;
            return;
        }

        activitiesContainer.innerHTML = activities.map(act => {
             const status = statusInfo[act.Status] || { text: act.Status, class: 'bg-gray-100 text-gray-800' };
             const time = act.StartTime ? `${act.StartTime.slice(0,5)} - ${act.EndTime ? act.EndTime.slice(0,5) : ''}` : 'Todo el día';

            return `
            <div class="bg-white rounded-lg shadow-md p-5 cursor-pointer edit-activity" data-activity-id="${act.ActivityID}">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-bold text-lg text-gray-800">${act.Name}</p>
                        <p class="text-sm text-gray-500">
                            <span class="font-medium">${new Date(act.ScheduledDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                        </p>
                        <p class="text-sm text-gray-500">${time}</p>
                    </div>
                    <div class="flex items-center space-x-3">
                         <span class="px-2 py-1 text-xs font-semibold rounded-full ${status.class}">${status.text}</span>
                    </div>
                </div>
                <p class="text-gray-700 mt-3">${act.Description || ''}</p>
                <div class="text-right text-xs text-gray-400 mt-3">
                    Responsable: ${act.employee?.FirstName || ''} ${act.employee?.LastName || 'N/A'}
                </div>
            </div>
        `}).join('');
    };

    const fetchActivities = async () => {
        try {
            const response = await fetch('/api/activities');
            if (!response.ok) throw new Error('Failed to fetch activities');
            currentActivities = await response.json();
            renderActivitiesList(currentActivities);
        } catch (error) {
            console.error(error);
            activitiesContainer.innerHTML = '<div class="col-span-7 text-center p-8 text-red-500">Error al cargar actividades.</div>';
        }
    };

    const fetchInitialData = async () => {
        try {
            activitiesContainer.innerHTML = '<div class="bg-white rounded-lg shadow p-6 text-center">Cargando...</div>';
            const [gradesRes, employeesRes, activitiesRes] = await Promise.all([
                fetch('/api/grades'),
                fetch('/api/employees'),
                fetch('/api/activities')
            ]);
            if (!gradesRes.ok || !employeesRes.ok || !activitiesRes.ok) throw new Error('Failed to fetch initial data');
            
            allGrades = await gradesRes.json();
            allEmployees = await employeesRes.json();
            currentActivities = await activitiesRes.json();
            
            gradeSelect.innerHTML = '<option value="">Todos/Ninguno</option>' + allGrades
                .filter(g => g.IsActive).map(g => `<option value="${g.GradeID}">${g.GradeName}</option>`).join('');
            employeeSelect.innerHTML = '<option value="">Seleccione</option>' + allEmployees
                .filter(e => e.IsActive).map(e => `<option value="${e.EmpID}">${e.FirstName} ${e.LastName}</option>`).join('');
            
            renderActivitiesList(currentActivities);
        } catch (error) {
            console.error(error);
             activitiesContainer.innerHTML = `<div class="bg-white rounded-lg shadow p-6 text-center text-red-500">Error al cargar los datos.</div>`;
        }
    };

    const renderMediaGallery = (mediaItems) => {
        mediaGallery.innerHTML = mediaItems.map(item => `
            <div class="relative group">
                <a href="${item.FilePath}" target="_blank">
                    ${item.MediaType === 'Image' 
                        ? `<img src="${item.FilePath}" class="w-full h-24 object-cover rounded-md">`
                        : `<div class="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center p-2 text-center text-xs text-gray-600">${item.Caption || 'Documento'}</div>`
                    }
                </a>
                <button class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity delete-media-btn" data-media-id="${item.MediaID}">X</button>
            </div>
        `).join('');
    };


    // Event Listeners
    addActivityButton.addEventListener('click', () => {
        openModal('Crear Nueva Actividad');
        document.getElementById('ScheduledDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('Status').value = 'Planned';
    });

    activitiesContainer.addEventListener('click', e => {
        const target = e.target.closest('.edit-activity');
        if (target) {
            const activityId = parseInt(target.dataset.activityId);
            const activity = currentActivities.find(a => a.ActivityID === activityId);
            if (!activity) return;

            openModal('Editar Actividad');
            deleteButton.classList.remove('hidden');
            multimediaSection.classList.remove('hidden');

            document.getElementById('activity-id').value = activity.ActivityID;
            document.getElementById('Name').value = activity.Name;
            document.getElementById('Description').value = activity.Description || '';
            document.getElementById('GradeID').value = activity.GradeID || '';
            document.getElementById('EmpID').value = activity.EmpID || '';
            document.getElementById('ScheduledDate').value = activity.ScheduledDate || '';
            document.getElementById('StartTime').value = activity.StartTime || '';
            document.getElementById('EndTime').value = activity.EndTime || '';
            document.getElementById('Location').value = activity.Location || '';
            document.getElementById('Category').value = activity.Category || '';
            document.getElementById('Status').value = activity.Status || 'Planned';

            renderMediaGallery(activity.activity_media);
        }
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    activityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(activityForm);
        const activityId = formData.get('ActivityID');
        const activityData = Object.fromEntries(formData.entries());
        activityData.GradeID = activityData.GradeID ? parseInt(activityData.GradeID) : null;
        activityData.EmpID = activityData.EmpID ? parseInt(activityData.EmpID) : null;

        const method = activityId ? 'PUT' : 'POST';
        const url = activityId ? `/api/activities/${activityId}` : '/api/activities';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData),
            });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to save');
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

    deleteButton.addEventListener('click', async () => {
        const activityId = document.getElementById('activity-id').value;
        if (!activityId || !confirm('¿Estás seguro de que quieres eliminar esta actividad?')) return;

        try {
            const response = await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            closeModal();
            fetchInitialData();
        } catch (error) {
            alert('Error al eliminar la actividad.');
        }
    });
    
    mediaUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const activityId = document.getElementById('activity-id').value;
        if (!activityId) return;

        uploadProgress.classList.remove('hidden');
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result;
            const mediaType = file.type.startsWith('image/') ? 'Image' : 'Document';

            try {
                const response = await fetch(`/api/activities/${activityId}/media`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileData: base64Data,
                        mediaType: mediaType,
                        caption: file.name,
                    }),
                });
                if (!response.ok) throw new Error('Upload failed');
                
                const newMediaItem = await response.json();
                const activity = currentActivities.find(a => a.ActivityID == activityId);
                activity.activity_media.push(newMediaItem);
                renderMediaGallery(activity.activity_media);

            } catch (error) {
                alert('Error al subir el archivo: ' + error.message);
            } finally {
                uploadProgress.classList.add('hidden');
                mediaUpload.value = '';
            }
        };
        reader.onerror = () => {
            alert('Error al leer el archivo.');
            uploadProgress.classList.add('hidden');
        };
    });

    mediaGallery.addEventListener('click', async (e) => {
        const target = e.target.closest('.delete-media-btn');
        if (target) {
            const mediaId = target.dataset.mediaId;
            if (!mediaId || !confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

            try {
                const response = await fetch(`/api/activities/media/${mediaId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete media');
                
                const activityId = document.getElementById('activity-id').value;
                const activity = currentActivities.find(a => a.ActivityID == activityId);
                activity.activity_media = activity.activity_media.filter(m => m.MediaID != mediaId);
                renderMediaGallery(activity.activity_media);
                
            } catch (error) {
                alert('Error al eliminar el archivo.');
            }
        }
    });

    // Initial Load
    fetchInitialData();
});