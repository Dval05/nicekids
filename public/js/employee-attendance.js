document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const datePicker = document.getElementById('date-picker');
    const statusFilter = document.getElementById('status-filter');

    let allEmployees = [];
    let attendanceRecords = [];

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const applyFiltersAndRender = () => {
        const selectedStatus = statusFilter.value;
        const attendanceMap = new Map(attendanceRecords.map(rec => [rec.EmpID, rec]));

        const filteredEmployees = allEmployees.filter(employee => {
            if (selectedStatus === 'all') {
                return true;
            }
            const record = attendanceMap.get(employee.EmpID);
            if (selectedStatus === 'Present' && record?.Status === 'Present') return true;
            if (selectedStatus === 'Absent' && record?.Status === 'Absent') return true;
            if (selectedStatus === 'Excused' && record?.Status === 'Excused') return true;
            return false;
        });

        renderTable(filteredEmployees, attendanceRecords);
    };

    const renderTable = (employees, records) => {
        const attendanceMap = new Map(records.map(rec => [rec.EmpID, rec]));

        if (!employees.length && allEmployees.length > 0) {
             tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay empleados que coincidan con el filtro seleccionado.</p>`;
             return;
        }

        if (!allEmployees.length) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay empleados activos.</p>`;
            return;
        }

        const statusMap = {
            Present: { text: 'Presente', class: 'bg-green-100 text-green-800' },
            Absent: { text: 'Ausente', class: 'bg-red-100 text-red-800' },
            Excused: { text: 'Justificado', class: 'bg-blue-100 text-blue-800' },
            Default: { text: 'Sin Registro', class: 'bg-gray-100 text-gray-800' }
        };

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Entrada</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Salida</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${employees.map(employee => {
                    const record = attendanceMap.get(employee.EmpID);
                    const statusInfo = (record && statusMap[record.Status]) ? statusMap[record.Status] : statusMap.Default;
                    
                    let actions = '';
                    const employeeId = employee.EmpID;
                    const attendanceId = record?.AttendanceID;
                    const status = record?.Status;

                    const btns = {
                        checkin: `<button class="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600 check-in-btn" data-employee-id="${employeeId}">Entrada</button>`,
                        checkout: `<button class="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600 check-out-btn" data-attendance-id="${attendanceId}">Salida</button>`,
                        absent: `<button class="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 mark-status-btn" data-employee-id="${employeeId}" data-status="Absent">Ausente</button>`,
                        excused: `<button class="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 mark-status-btn" data-employee-id="${employeeId}" data-status="Excused">Justificado</button>`,
                    };
                    
                    if (!record) {
                        actions = `${btns.checkin} ${btns.absent} ${btns.excused}`;
                    } else if (status === 'Present' && !record.CheckOutTime) {
                        actions = `${btns.checkout} ${btns.absent} ${btns.excused}`;
                    } else if (status === 'Present' && record.CheckOutTime) {
                        actions = `${btns.absent} ${btns.excused}`;
                    } else if (status === 'Absent') {
                        actions = `${btns.checkin} ${btns.excused}`;
                    } else if (status === 'Excused') {
                        actions = `${btns.checkin} ${btns.absent}`;
                    }

                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${employee.FirstName} ${employee.LastName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record?.CheckInTime || ' - '}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record?.CheckOutTime || ' - '}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}">
                                    ${statusInfo.text}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                ${actions || ' - '}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };

    const fetchDataForDate = async (date) => {
        try {
            tableContainer.innerHTML = '<p class="p-4 text-center">Cargando...</p>';
            const [employeesRes, attendanceRes] = await Promise.all([
                fetch('/api/employees'),
                fetch(`/api/employee-attendance?date=${date}`)
            ]);
            if (!employeesRes.ok || !attendanceRes.ok) throw new Error('Failed to fetch data');

            const allActiveEmployees = (await employeesRes.json()).filter(s => s.IsActive);
            allEmployees = allActiveEmployees;
            attendanceRecords = await attendanceRes.json();
            
            applyFiltersAndRender();

        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los datos de asistencia.</p>`;
            console.error('Error fetching data:', error);
        }
    };

    datePicker.addEventListener('change', (e) => fetchDataForDate(e.target.value));
    statusFilter.addEventListener('change', applyFiltersAndRender);

    tableContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const date = datePicker.value;

        const disableButton = (btn, text = '...') => {
            btn.disabled = true;
            btn.textContent = text;
        };
        
        if (target.classList.contains('check-in-btn')) {
            disableButton(target);
            const employeeId = target.dataset.employeeId;
            await fetch('/api/employee-attendance/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, date })
            });
            fetchDataForDate(date);
        }

        if (target.classList.contains('check-out-btn')) {
            disableButton(target);
            const attendanceId = target.dataset.attendanceId;
            await fetch(`/api/employee-attendance/checkout/${attendanceId}`, {
                method: 'PUT'
            });
            fetchDataForDate(date);
        }

        if (target.classList.contains('mark-status-btn')) {
            disableButton(target);
            const employeeId = target.dataset.employeeId;
            const status = target.dataset.status;
            await fetch('/api/employee-attendance/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, date, status })
            });
            fetchDataForDate(date);
        }
    });

    // Initial setup
    datePicker.value = formatDate(new Date());
    fetchDataForDate(datePicker.value);
});