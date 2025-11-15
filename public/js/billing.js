document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const modal = document.getElementById('payment-modal');
    const addButton = document.getElementById('add-payment-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const paymentForm = document.getElementById('payment-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const studentSelect = document.getElementById('StudentID');

    let allPayments = [];
    let filteredPayments = [];
    let allStudents = [];
    let currentPage = 1;
    const rowsPerPage = 10;

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        paymentForm.reset();
        document.getElementById('payment-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };
    
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        filteredPayments = allPayments.filter(payment => {
            const statusMatch = statusValue === 'all' || payment.Status === statusValue;
            const student = allStudents.find(s => s.StudentID === payment.StudentID);
            const studentName = student ? `${student.FirstName} ${student.LastName}`.toLowerCase() : '';
            const notes = payment.Notes?.toLowerCase() || '';

            const searchMatch = !searchTerm || studentName.includes(searchTerm) || notes.includes(searchTerm);
            
            return statusMatch && searchMatch;
        });

        renderPage(1);
    };

    const renderTable = () => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = filteredPayments.slice(start, end);

        if (paginatedData.length === 0 && allPayments.length > 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No se encontraron pagos que coincidan con los filtros.</p>`;
            return;
        }
         if (allPayments.length === 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay pagos registrados.</p>`;
            return;
        }

        const statusClasses = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Paid': 'bg-green-100 text-green-800',
            'Partially Paid': 'bg-blue-100 text-blue-800',
            'Overdue': 'bg-red-100 text-red-800',
        };

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${paginatedData.map(payment => {
                    const student = allStudents.find(s => s.StudentID === payment.StudentID);
                    const studentName = student ? `${student.FirstName} ${student.LastName}` : 'Desconocido';
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${studentName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(payment.DueDate).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${Number(payment.TotalAmount).toFixed(2)}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[payment.Status] || ''}">
                                    ${payment.Status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <a href="/invoice?paymentId=${payment.StudentPaymentID}" target="_blank" class="text-indigo-600 hover:text-indigo-900">Ver Factura</a>
                                <button class="text-primary hover:text-primary-focus edit-button" data-payment='${JSON.stringify(payment)}'>Editar</button>
                                <button class="text-error hover:text-red-700 delete-button" data-id="${payment.StudentPaymentID}">Eliminar</button>
                            </td>
                        </tr>
                    `}).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };

    const renderPagination = () => {
        const pageCount = Math.ceil(filteredPayments.length / rowsPerPage);
        const startRecord = filteredPayments.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
        const endRecord = Math.min(currentPage * rowsPerPage, filteredPayments.length);
        paginationContainer.innerHTML = pageCount <= 1 ? '' : `
            <div class="text-sm text-gray-700">Mostrando ${startRecord} a ${endRecord} de ${filteredPayments.length} resultados</div>
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

    const fetchInitialData = async () => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const [paymentsRes, studentsRes] = await Promise.all([
                fetch('/api/billing'),
                fetch('/api/students')
            ]);
            if (!paymentsRes.ok || !studentsRes.ok) throw new Error('Network response was not ok');
            
            allPayments = await paymentsRes.json();
            allStudents = await studentsRes.json();

            studentSelect.innerHTML = '<option value="">Seleccione</option>' + allStudents
                .filter(s => s.IsActive)
                .map(s => `<option value="${s.StudentID}">${s.FirstName} ${s.LastName}</option>`).join('');

            applyFilters();
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los datos.</p>`;
        }
    };

    addButton.addEventListener('click', () => {
        openModal('Registrar Nuevo Pago');
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(paymentForm);
        const paymentId = formData.get('StudentPaymentID');
        const paymentData = Object.fromEntries(formData.entries());
        
        // Convert numbers
        paymentData.StudentID = parseInt(paymentData.StudentID);
        paymentData.TotalAmount = parseFloat(paymentData.TotalAmount);
        paymentData.PaidAmount = paymentData.PaidAmount ? parseFloat(paymentData.PaidAmount) : null;


        const method = paymentId ? 'PUT' : 'POST';
        const url = paymentId ? `/api/billing/${paymentId}` : '/api/billing';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
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

    tableContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-button')) {
            const payment = JSON.parse(target.dataset.payment);
            openModal('Editar Registro de Pago');
            for(const key in payment) {
                const input = document.getElementById(key);
                if (input) {
                    if (key === 'DueDate') {
                        input.value = payment[key] ? new Date(payment[key]).toISOString().split('T')[0] : '';
                    } else {
                        input.value = payment[key];
                    }
                }
            }
            document.getElementById('payment-id').value = payment.StudentPaymentID;
        }

        if (target.classList.contains('delete-button')) {
            if (confirm('¿Estás seguro de que quieres eliminar este registro de pago?')) {
                fetch(`/api/billing/${target.dataset.id}`, { method: 'DELETE' })
                    .then(res => res.ok ? fetchInitialData() : alert('Error al eliminar'));
            }
        }
    });
    
    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('prev-btn')) renderPage(currentPage - 1);
        if (e.target.classList.contains('next-btn')) renderPage(currentPage + 1);
    });

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    fetchInitialData();
});