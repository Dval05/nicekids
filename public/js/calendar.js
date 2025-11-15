document.addEventListener('DOMContentLoaded', () => {
    const calendarContainer = document.getElementById('calendar-container');
    const currentViewTitle = document.getElementById('current-view-title');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const todayBtn = document.getElementById('today-btn');
    const monthViewBtn = document.getElementById('month-view-btn');
    const weekViewBtn = document.getElementById('week-view-btn');
    const dayViewBtn = document.getElementById('day-view-btn');
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

    let currentDate = new Date();
    let currentView = 'month'; // 'month', 'week', 'day'
    let allGrades = [];
    let allEmployees = [];
    let currentActivities = [];

    const statusColors = {
        'Planned': 'bg-blue-500',
        'Ongoing': 'bg-yellow-500',
        'Completed': 'bg-green-500',
        'Cancelled': 'bg-red-500'
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

    const render = async () => {
        calendarContainer.innerHTML = '<div class="col-span-7 text-center p-8">Cargando...</div>';
        await fetchActivities();
        updateView();
    };

    const updateView = () => {
        updateViewButtons();
        switch (currentView) {
            case 'month':
                renderMonthView();
                break;
            case 'week':
                renderWeekView();
                break;
            case 'day':
                renderDayView();
                break;
        }
    };
    
    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        currentViewTitle.textContent = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const totalDays = lastDay.getDate();

        let html = '<div class="grid grid-cols-7 gap-1">';
        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(day => {
            html += `<div class="text-center font-semibold text-sm text-gray-600 py-2">${day}</div>`;
        });

        for (let i = 0; i < firstDayOfWeek; i++) {
            html += '<div></div>';
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const activitiesForDay = currentActivities.filter(a => a.ScheduledDate === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            html += `
                <div class="border p-2 min-h-28 flex flex-col">
                    <div class="font-bold text-sm mb-1 self-end ${isToday ? 'bg-primary text-white' : ''} rounded-full h-6 w-6 flex items-center justify-center">${day}</div>
                    <div class="space-y-1 overflow-y-auto text-xs">
                        ${activitiesForDay.map(act => `
                            <div class="bg-gray-100 p-1 rounded cursor-pointer edit-activity flex items-center" data-activity-id="${act.ActivityID}">
                                <span class="w-2 h-2 rounded-full mr-2 ${statusColors[act.Status] || 'bg-gray-400'}"></span>
                                <span class="flex-1 truncate">${act.Name}</span>
                            </div>`).join('')}
                    </div>
                </div>`;
        }
        html += '</div>';
        calendarContainer.innerHTML = html;
    };

    const renderWeekView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();

        const startOfWeek = new Date(year, month, day - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        currentViewTitle.textContent = `${startOfWeek.toLocaleDateString('es-ES', {day:'numeric', month:'short'})} - ${endOfWeek.toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'numeric'})}`;

        let html = '<div class="grid grid-cols-7 border-t border-l">';
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            weekDates.push(date);
            const isToday = new Date().toDateString() === date.toDateString();
            html += `<div class="text-center font-semibold text-sm text-gray-600 py-2 border-r border-b">
                        <div class="text-xs">${date.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                        <div class="text-lg ${isToday ? 'bg-primary text-white rounded-full mx-auto w-8 h-8 flex items-center justify-center' : ''}">${date.getDate()}</div>
                     </div>`;
        }

        for (const date of weekDates) {
             const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
             const activitiesForDay = currentActivities.filter(a => a.ScheduledDate === dateStr).sort((a,b) => (a.StartTime || '').localeCompare(b.StartTime || ''));
             html += `<div class="border-r border-b p-2 min-h-48">
                        <div class="space-y-2 overflow-y-auto text-xs">
                         ${activitiesForDay.map(act => `
                            <div class="bg-gray-100 p-2 rounded cursor-pointer edit-activity flex flex-col" data-activity-id="${act.ActivityID}">
                                <div class="flex items-center mb-1">
                                    <span class="w-2 h-2 rounded-full mr-2 ${statusColors[act.Status] || 'bg-gray-400'}"></span>
                                    <span class="flex-1 font-bold truncate">${act.Name}</span>
                                </div>
                                <span class="text-gray-500">${act.StartTime ? act.StartTime.slice(0,5) : 'Todo el día'}</span>
                            </div>`).join('')}
                        </div>
                     </div>`;
        }
        html += '</div>';
        calendarContainer.innerHTML = html;
    };
    
    const renderDayView = () => {
        currentViewTitle.textContent = currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const activitiesForDay = currentActivities.filter(a => a.ScheduledDate === dateStr).sort((a,b) => (a.StartTime || '').localeCompare(b.StartTime || ''));

        let html = '<div class="border-t">';
        if (activitiesForDay.length === 0) {
            html += '<p class="text-center text-gray-500 p-8">No hay actividades programadas para este día.</p>';
        } else {
             html += activitiesForDay.map(act => `
                <div class="flex p-4 border-b cursor-pointer edit-activity hover:bg-gray-50" data-activity-id="${act.ActivityID}">
                    <div class="w-24 text-sm font-medium text-gray-600">${act.StartTime ? act.StartTime.slice(0,5) : 'Todo el día'}</div>
                    <div class="flex-1 flex items-start">
                        <span class="w-3 h-3 rounded-full mt-1 mr-3 ${statusColors[act.Status] || 'bg-gray-400'}"></span>
                        <div>
                            <p class="font-semibold text-gray-800">${act.Name}</p>
                            <p class="text-sm text-gray-500">${act.Description || ''}</p>
                        </div>
                    </div>
                </div>
             `).join('');
        }
        html += '</div>';
        calendarContainer.innerHTML = html;
    };

    const fetchActivities = async () => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const response = await fetch(`/api/activities?year=${year}&month=${month}`);
            if (!response.ok) throw new Error('Failed to fetch activities');
            currentActivities = await response.json();
        } catch (error) {
            console.error(error);
            calendarContainer.innerHTML = '<div class="col-span-7 text-center p-8 text-red-500">Error al cargar actividades.</div>';
        }
    };

    const fetchInitialData = async () => {
        try {
            const [gradesRes, employeesRes] = await Promise.all([
                fetch('/api/grades'),
                fetch('/api/employees')
            ]);
            if (!gradesRes.ok || !employeesRes.ok) throw new Error('Failed to fetch grades or employees');
            
            allGrades = await gradesRes.json();
            allEmployees = await employeesRes.json();
            
            gradeSelect.innerHTML = '<option value="">Todos/Ninguno</option>' + allGrades
                .filter(g => g.IsActive).map(g => `<option value="${g.GradeID}">${g.GradeName}</option>`).join('');
            employeeSelect.innerHTML = '<option value="">Seleccione</option>' + allEmployees
                .filter(e => e.IsActive).map(e => `<option value="${e.EmpID}">${e.FirstName} ${e.LastName}</option>`).join('');
        } catch (error) {
            console.error(error);
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

    const updateViewButtons = () => {
        [monthViewBtn, weekViewBtn, dayViewBtn].forEach(btn => btn.classList.remove('bg-primary', 'text-white'));
        if (currentView === 'month') monthViewBtn.classList.add('bg-primary', 'text-white');
        if (currentView === 'week') weekViewBtn.classList.add('bg-primary', 'text-white');
        if (currentView === 'day') dayViewBtn.classList.add('bg-primary', 'text-white');
    };
    
    const navigate = (direction) => {
        if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() + direction);
        if (currentView === 'week') currentDate.setDate(currentDate.getDate() + (7 * direction));
        if (currentView === 'day') currentDate.setDate(currentDate.getDate() + direction);
        render();
    };

    // Event Listeners
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
    todayBtn.addEventListener('click', () => { currentDate = new Date(); render(); });
    monthViewBtn.addEventListener('click', () => { currentView = 'month'; updateView(); });
    weekViewBtn.addEventListener('click', () => { currentView = 'week'; updateView(); });
    dayViewBtn.addEventListener('click', () => { currentView = 'day'; updateView(); });

    addActivityButton.addEventListener('click', () => {
        openModal('Crear Nueva Actividad');
        document.getElementById('ScheduledDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('Status').value = 'Planned';
    });

    calendarContainer.addEventListener('click', e => {
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
            render();
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
            render();
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
    render();
});