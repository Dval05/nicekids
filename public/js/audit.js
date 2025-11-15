document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const paginationContainer = document.getElementById('pagination-container');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const userFilter = document.getElementById('user-filter');
    const actionFilter = document.getElementById('action-filter');
    
    const modal = document.getElementById('details-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const oldDataPre = document.getElementById('old-data');
    const newDataPre = document.getElementById('new-data');

    let allLogs = [];
    let filteredLogs = [];
    let currentPage = 1;
    const rowsPerPage = 15;

    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    const applyFilters = () => {
        const start = startDateInput.value ? new Date(startDateInput.value).setHours(0,0,0,0) : null;
        const end = endDateInput.value ? new Date(endDateInput.value).setHours(23,59,59,999) : null;
        const userId = userFilter.value;
        const action = actionFilter.value;

        filteredLogs = allLogs.filter(log => {
            const logDate = new Date(log.CreatedAt).getTime();
            if (start && logDate < start) return false;
            if (end && logDate > end) return false;
            if (userId && log.UserID != userId) return false;
            if (action && log.Action !== action) return false;
            return true;
        });
        
        renderPage(1);
    };

    const renderTable = () => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedLogs = filteredLogs.slice(start, end);

        if (filteredLogs.length === 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No se encontraron registros con los filtros aplicados.</p>`;
            paginationContainer.innerHTML = '';
            return;
        }

        const table = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Registro</th>
                        <th class="relative px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${paginatedLogs.map(log => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${new Date(log.CreatedAt).toLocaleString('es-EC')}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">${log.user?.FirstName || ''} ${log.user?.LastName || `(${log.user?.UserName})`}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${log.Action}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${log.TableName || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${log.RecordID || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-primary hover:text-primary-focus view-details-btn" data-log-index="${allLogs.indexOf(log)}">Ver Detalles</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        tableContainer.innerHTML = table;
    };

    const renderPagination = () => {
        const pageCount = Math.ceil(filteredLogs.length / rowsPerPage);
        const startRecord = filteredLogs.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
        const endRecord = Math.min(currentPage * rowsPerPage, filteredLogs.length);

        paginationContainer.innerHTML = pageCount <= 1 ? '' : `
            <div class="text-sm text-gray-700">Mostrando ${startRecord} a ${endRecord} de ${filteredLogs.length} resultados</div>
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

    const fetchLogs = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const response = await fetch('/api/audit');
            if (!response.ok) throw new Error('Failed to fetch audit logs');
            
            const { logs, users } = await response.json();
            allLogs = logs;

            // Populate user filter
            userFilter.innerHTML = '<option value="">Todos los Usuarios</option>' + users.map(u => 
                `<option value="${u.UserID}">${u.FirstName || ''} ${u.LastName || `(${u.UserName})`}</option>`
            ).join('');

            applyFilters();
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">${error.message}</p>`;
        }
    };

    // Event Listeners
    [startDateInput, endDateInput, userFilter, actionFilter].forEach(el => {
        el.addEventListener('change', applyFilters);
    });

    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('prev-btn')) renderPage(currentPage - 1);
        if (e.target.classList.contains('next-btn')) renderPage(currentPage + 1);
    });
    
    tableContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details-btn')) {
            const logIndex = e.target.dataset.logIndex;
            const log = allLogs[logIndex];
            if (log) {
                oldDataPre.textContent = log.OldData ? JSON.stringify(log.OldData, null, 2) : 'N/A';
                newDataPre.textContent = log.NewData ? JSON.stringify(log.NewData, null, 2) : 'N/A';
                openModal();
            }
        }
    });

    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    // Initial load
    fetchLogs();
});