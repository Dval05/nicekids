document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const datePicker = document.getElementById('date-picker');

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderTable = (students, attendanceRecords) => {
        const attendanceMap = new Map(attendanceRecords.map(rec => [rec.StudentID, rec]));

        if (!students.length) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay estudiantes activos.</p>`;
            return;
        }

        const statusMap = {
            Present: { text: 'Presente', class: 'bg-green-100 text-green-800' },
            Absent: { text: 'Ausente', class: 'bg-red-100 text-red-800' },
            Excused: { text: 'Justificado', class: 'bg-blue-100 text-blue-800' },
            Tardy: { text: 'Tardanza', class: 'bg-yellow-100 text-yellow-800' },
            Default: { text: 'Sin Registro', class: 'bg-gray-100 text-gray-800' }
        };

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Entrada</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora de Salida</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${students.map(student => {
                    const record = attendanceMap.get(student.StudentID);
                    const statusInfo = (record && statusMap[record.Status]) ? statusMap[record.Status] : statusMap.Default;
                    
                    let actions = '';
                    const studentId = student.StudentID;
                    const attendanceId = record?.AttendanceID;
                    const status = record?.Status;

                    const btns = {
                        checkin: `<button class="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600 check-in-btn" data-student-id="${studentId}">Entrada</button>`,
                        checkout: `<button class="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600 check-out-btn" data-attendance-id="${attendanceId}">Salida</button>`,
                        absent: `<button class="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 mark-status-btn" data-student-id="${studentId}" data-status="Absent">Ausente</button>`,
                        excused: `<button class="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 mark-status-btn" data-student-id="${studentId}" data-status="Excused">Justificado</button>`,
                    };

                    if (!record) {
                        // No record for today
                        actions = `${btns.checkin} ${btns.absent} ${btns.excused}`;
                    } else {
                        switch (status) {
                            case 'Present':
                                if (record.CheckOutTime) {
                                    // Fully attended, can still be marked absent/excused as a correction
                                    actions = `${btns.absent} ${btns.excused}`;
                                } else {
                                    // Checked in, but not out yet
                                    actions = `${btns.checkout} ${btns.absent} ${btns.excused}`;
                                }
                                break;
                            case 'Absent':
                                // Marked absent, can be corrected to Present or Excused
                                actions = `${btns.checkin} ${btns.excused}`;
                                break;
                            case 'Excused':
                                // Marked excused, can be corrected to Present or Absent
                                actions = `${btns.checkin} ${btns.absent}`;
                                break;
                            default:
                                // Fallback for other statuses like 'Tardy'
                                actions = ' - ';
                        }
                    }
                    if (!actions.trim()) {
                        actions = ' - ';
                    }


                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${student.FirstName} ${student.LastName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record?.CheckInTime || ' - '}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record?.CheckOutTime || ' - '}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}">
                                    ${statusInfo.text}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                ${actions}
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
            const [studentsRes, attendanceRes] = await Promise.all([
                fetch('/api/students'),
                fetch(`/api/attendance?date=${date}`)
            ]);
            if (!studentsRes.ok || !attendanceRes.ok) throw new Error('Failed to fetch data');

            const allStudents = await studentsRes.json();
            const attendanceRecords = await attendanceRes.json();
            
            const activeStudents = allStudents.filter(s => s.IsActive);

            renderTable(activeStudents, attendanceRecords);

        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los datos de asistencia.</p>`;
            console.error('Error fetching data:', error);
        }
    };

    datePicker.addEventListener('change', (e) => {
        fetchDataForDate(e.target.value);
    });

    tableContainer.addEventListener('click', async (e) => {
        const target = e.target;
        const date = datePicker.value;

        if (target.classList.contains('check-in-btn')) {
            target.disabled = true;
            target.textContent = '...';
            const studentId = target.dataset.studentId;
            
            const response = await fetch('/api/attendance/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, date })
            });

            if(response.ok) {
                fetchDataForDate(date);
            } else {
                alert('Error al registrar la entrada.');
                target.disabled = false;
                target.textContent = 'Registrar Entrada';
            }
        }

        if (target.classList.contains('check-out-btn')) {
            target.disabled = true;
            target.textContent = '...';
            const attendanceId = target.dataset.attendanceId;

            const response = await fetch(`/api/attendance/checkout/${attendanceId}`, {
                method: 'PUT'
            });

            if(response.ok) {
                fetchDataForDate(date);
            } else {
                alert('Error al registrar la salida.');
                target.disabled = false;
                target.textContent = 'Registrar Salida';
            }
        }

        if (target.classList.contains('mark-status-btn')) {
            target.disabled = true;
            target.textContent = '...';
            const studentId = target.dataset.studentId;
            const status = target.dataset.status;

            const response = await fetch('/api/attendance/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, date, status })
            });

            if (!response.ok) {
                alert(`Error al marcar como ${status.toLowerCase()}.`);
                fetchDataForDate(date); // Refresh to restore button state
            } else {
                fetchDataForDate(date);
            }
        }
    });

    // Initial setup
    datePicker.value = formatDate(new Date());
    fetchDataForDate(datePicker.value);
});