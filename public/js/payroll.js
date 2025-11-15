document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const paginationContainer = document.getElementById('pagination-container');
    const modal = document.getElementById('payment-modal');
    const addButton = document.getElementById('add-payment-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const paymentForm = document.getElementById('payment-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const employeeSelect = document.getElementById('EmpID');

    let allPayments = [];
    let allEmployees = [];
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
    };

    const renderTable = () => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = allPayments.slice(start, end);

        if (allPayments.length === 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay pagos registrados.</p>`;
            return;
        }

        const statusClasses = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Paid': 'bg-green-100 text-green-800',
        };
        
        tableContainer.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th class="relative px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${paginatedData.map(p => {
                        const emp = allEmployees.find(e => e.EmpID === p.EmpID);
                        return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${emp ? `${emp.FirstName} ${emp.LastName}` : 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${p.PaymentPeriod}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${Number(p.TotalAmount).toFixed(2)}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[p.Status] || ''}">${p.Status}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button class="text-primary hover:text-primary-focus edit-button" data-payment='${JSON.stringify(p)}'>Editar</button>
                                <button class="text-error hover:text-red-700 delete-button" data-id="${p.TeacherPaymentID}">Eliminar</button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`;
    };

    const renderPagination = () => {
        const pageCount = Math.ceil(allPayments.length / rowsPerPage);
        paginationContainer.innerHTML = pageCount <= 1 ? '' : `
            <div></div>
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
            const [paymentsRes, employeesRes] = await Promise.all([
                fetch('/api/payroll'),
                fetch('/api/employees')
            ]);
            if (!paymentsRes.ok || !employeesRes.ok) throw new Error('Network response was not ok');
            
            allPayments = await paymentsRes.json();
            allEmployees = await employeesRes.json();

            employeeSelect.innerHTML = '<option value="">Seleccione</option>' + allEmployees
                .filter(e => e.IsActive)
                .map(e => `<option value="${e.EmpID}">${e.FirstName} ${e.LastName}</option>`).join('');
            
            renderPage(1);
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar datos.</p>`;
        }
    };
    
    const calculateTotal = () => {
        const base = parseFloat(document.getElementById('BaseSalary').value) || 0;
        const bonuses = parseFloat(document.getElementById('Bonuses').value) || 0;
        const deductions = parseFloat(document.getElementById('Deductions').value) || 0;
        document.getElementById('TotalAmount').value = (base + bonuses - deductions).toFixed(2);
    };
    ['BaseSalary', 'Bonuses', 'Deductions'].forEach(id => document.getElementById(id).addEventListener('input', calculateTotal));


    addButton.addEventListener('click', () => {
        openModal('Registrar Pago de Nómina');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('PaymentDate').value = today;
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(paymentForm);
        const paymentId = formData.get('TeacherPaymentID');
        const paymentData = Object.fromEntries(formData.entries());
        
        ['EmpID', 'BaseSalary', 'Bonuses', 'Deductions', 'TotalAmount'].forEach(key => {
            paymentData[key] = parseFloat(paymentData[key]) || null;
        });

        const method = paymentId ? 'PUT' : 'POST';
        const url = paymentId ? `/api/payroll/${paymentId}` : '/api/payroll';

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
            openModal('Editar Pago de Nómina');
            for(const key in payment) {
                const input = document.getElementById(key);
                if (input) {
                    if (['PaymentDate', 'PeriodStartDate', 'PeriodEndDate'].includes(key)) {
                        input.value = payment[key] ? new Date(payment[key]).toISOString().split('T')[0] : '';
                    } else {
                        input.value = payment[key] ?? '';
                    }
                }
            }
            document.getElementById('payment-id').value = payment.TeacherPaymentID;
        }

        if (target.classList.contains('delete-button')) {
            if (confirm('¿Estás seguro de que quieres eliminar este registro de pago?')) {
                fetch(`/api/payroll/${target.dataset.id}`, { method: 'DELETE' })
                    .then(res => res.ok ? fetchInitialData() : alert('Error al eliminar'));
            }
        }
    });
    
    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('prev-btn')) renderPage(currentPage - 1);
        if (e.target.classList.contains('next-btn')) renderPage(currentPage + 1);
    });

    fetchInitialData();
});