document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const reportTypeSelect = document.getElementById('report-type');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-report-btn');
    const reportResultsContainer = document.getElementById('report-results-container');
    const reportResults = document.getElementById('report-results');
    const paginationContainer = document.getElementById('pagination-container');
    const reportActions = document.getElementById('report-actions');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportExcelBtn = document.getElementById('export-excel');
    const aiAnalysisContainer = document.getElementById('ai-analysis-container');
    const aiAnalysisResult = document.getElementById('ai-analysis-result');

    let fullReportData = [];
    let currentPage = 1;
    const rowsPerPage = 10;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Handles both 'YYYY-MM-DD' and full ISO strings
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const showRegularReportView = () => {
        aiAnalysisContainer.classList.add('hidden');
        reportResultsContainer.classList.remove('hidden');
    };

    const showAiAnalysisView = () => {
        reportResultsContainer.classList.add('hidden');
        reportActions.classList.add('hidden');
        aiAnalysisContainer.classList.remove('hidden');
    };

    const renderTable = (data) => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        if (data.length === 0) {
            reportResults.innerHTML = `<p class="p-6 text-center text-gray-500">No se encontraron registros para los criterios seleccionados.</p>`;
            return;
        }

        const reportType = reportTypeSelect.value;
        let headers = [];
        let tableBodyHtml = '';

        switch (reportType) {
            case 'student_attendance':
            case 'employee_attendance':
                headers = [reportType === 'student_attendance' ? 'Estudiante' : 'Empleado', 'Fecha', 'Entrada', 'Salida', 'Estado'];
                tableBodyHtml = paginatedData.map(row => {
                    const person = row.student || row.employee;
                    const name = person ? `${person.FirstName} ${person.LastName}` : 'N/A';
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(row.Date)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.CheckInTime || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.CheckOutTime || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.Status || '-'}</td>
                        </tr>
                    `;
                }).join('');
                break;
            case 'student_performance':
                headers = ['Estudiante', 'Fecha', 'Categoría', 'Observación', 'Registrado por'];
                tableBodyHtml = paginatedData.map(row => {
                    const studentName = row.student ? `${row.student.FirstName} ${row.student.LastName}` : 'N/A';
                    const employeeName = row.employee ? `${row.employee.FirstName} ${row.employee.LastName}` : 'N/A';
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${studentName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(row.ObservationDate)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.Category || '-'}</td>
                            <td class="px-6 py-4 text-sm text-gray-600 min-w-[300px] whitespace-normal">${row.Observation}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employeeName}</td>
                        </tr>
                    `;
                }).join('');
                break;
            case 'student_payments':
                headers = ['Estudiante', 'Vencimiento', 'Monto Total', 'Estado', 'Tipo Servicio'];
                tableBodyHtml = paginatedData.map(row => {
                    const studentName = row.student ? `${row.student.FirstName} ${row.student.LastName}` : 'N/A';
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${studentName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(row.DueDate)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${Number(row.TotalAmount).toFixed(2)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.Status || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.ServiceType || '-'}</td>
                        </tr>
                    `;
                }).join('');
                break;
            case 'teacher_payments':
                headers = ['Docente', 'Periodo', 'Fecha de Pago', 'Monto Total', 'Estado'];
                tableBodyHtml = paginatedData.map(row => {
                    const employeeName = row.employee ? `${row.employee.FirstName} ${row.employee.LastName}` : 'N/A';
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${employeeName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.PaymentPeriod}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(row.PaymentDate)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${Number(row.TotalAmount).toFixed(2)}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.Status || '-'}</td>
                        </tr>
                    `;
                }).join('');
                break;
        }

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    ${headers.map(h => `<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">${tableBodyHtml}</tbody>
        `;
        reportResults.innerHTML = '';
        reportResults.appendChild(table);
    };

    const renderPagination = () => {
        const pageCount = Math.ceil(fullReportData.length / rowsPerPage);
        const startRecord = fullReportData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
        const endRecord = Math.min(currentPage * rowsPerPage, fullReportData.length);

        if (pageCount <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let pageButtons = '';
        for (let i = 1; i <= pageCount; i++) {
            const isActive = i === currentPage ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50';
            pageButtons += `<button class="px-3 py-1 border border-gray-300 rounded-md text-sm page-btn" data-page="${i}">${i}</button>`;
        }
        
        paginationContainer.innerHTML = `
            <div class="text-sm text-gray-700">
                Mostrando <span class="font-medium">${startRecord}</span> a <span class="font-medium">${endRecord}</span> de <span class="font-medium">${fullReportData.length}</span> resultados
            </div>
            <div class="flex items-center space-x-1">${pageButtons}</div>
        `;
    };

    const renderPage = (page) => {
        currentPage = page;
        renderTable(fullReportData);
        renderPagination();
    };
    
    const generateAiAnalysis = async (startDate, endDate) => {
        showAiAnalysisView();
        aiAnalysisResult.innerHTML = `<div class="flex flex-col items-center justify-center p-10"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div><p class="mt-4 text-gray-600">La IA está analizando los datos. Esto puede tardar un momento...</p></div>`;

        try {
            const response = await fetch(`/api/reports/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al generar el análisis.');
            }
            const data = await response.json();
            // Using a <pre> tag to respect whitespace and newlines from the model's response
            aiAnalysisResult.innerHTML = `<pre class="whitespace-pre-wrap font-sans text-sm text-gray-800">${data.analysis}</pre>`;

        } catch (error) {
            aiAnalysisResult.innerHTML = `<p class="p-6 text-center text-red-500">${error.message}</p>`;
        }
    };


    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generando...';
        
        const type = reportTypeSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (type === 'ai_financial_analysis') {
            await generateAiAnalysis(startDate, endDate);
        } else {
            showRegularReportView();
            reportResults.innerHTML = `<p class="p-6 text-center">Cargando datos...</p>`;
            paginationContainer.innerHTML = '';
            reportActions.classList.add('hidden');
            try {
                const response = await fetch(`/api/reports?type=${type}&startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Error al generar el reporte.');
                }
                fullReportData = await response.json();
                
                if (fullReportData.length > 0) {
                    reportActions.classList.remove('hidden');
                }
                
                renderPage(1);

            } catch (error) {
                reportResults.innerHTML = `<p class="p-6 text-center text-red-500">${error.message}</p>`;
            }
        }
        
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generar Reporte';
    });

    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn')) {
            const page = parseInt(e.target.dataset.page);
            if (page !== currentPage) {
                renderPage(page);
            }
        }
    });

    const getExportData = () => {
        const reportType = reportTypeSelect.value;
        let headers = [];
        let body = [];

        switch (reportType) {
            case 'student_attendance':
            case 'employee_attendance':
                headers = [reportType === 'student_attendance' ? 'Estudiante' : 'Empleado', 'Fecha', 'Entrada', 'Salida', 'Estado'];
                body = fullReportData.map(row => {
                    const person = row.student || row.employee;
                    const name = person ? `${person.FirstName} ${person.LastName}` : 'N/A';
                    return [name, formatDate(row.Date), row.CheckInTime || '-', row.CheckOutTime || '-', row.Status || '-'];
                });
                break;
            case 'student_performance':
                headers = ['Estudiante', 'Fecha', 'Categoría', 'Observación', 'Registrado por'];
                 body = fullReportData.map(row => {
                    const studentName = row.student ? `${row.student.FirstName} ${row.student.LastName}` : 'N/A';
                    const employeeName = row.employee ? `${row.employee.FirstName} ${row.employee.LastName}` : 'N/A';
                    return [studentName, formatDate(row.ObservationDate), row.Category || '-', row.Observation, employeeName];
                });
                break;
            case 'student_payments':
                headers = ['Estudiante', 'Vencimiento', 'Monto Total', 'Estado', 'Tipo Servicio'];
                body = fullReportData.map(row => {
                    const studentName = row.student ? `${row.student.FirstName} ${row.student.LastName}` : 'N/A';
                    return [studentName, formatDate(row.DueDate), `$${Number(row.TotalAmount).toFixed(2)}`, row.Status || '-', row.ServiceType || '-'];
                });
                break;
            case 'teacher_payments':
                headers = ['Docente', 'Periodo', 'Fecha de Pago', 'Monto Total', 'Estado'];
                body = fullReportData.map(row => {
                    const employeeName = row.employee ? `${row.employee.FirstName} ${row.employee.LastName}` : 'N/A';
                    return [employeeName, row.PaymentPeriod, formatDate(row.PaymentDate), `$${Number(row.TotalAmount).toFixed(2)}`, row.Status || '-'];
                });
                break;
        }
        return { headers, body };
    };

    exportPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const typeName = reportTypeSelect.options[reportTypeSelect.selectedIndex].text;
        const title = `Reporte de ${typeName}`;
        const startDate = formatDate(startDateInput.value);
        const endDate = formatDate(endDateInput.value);
        const { headers, body } = getExportData();

        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 30);

        doc.autoTable({
            startY: 35,
            head: [headers],
            body: body,
        });

        doc.save(`reporte_${reportTypeSelect.value}_${startDate}_${endDate}.pdf`);
    });

    exportExcelBtn.addEventListener('click', () => {
        const startDate = formatDate(startDateInput.value);
        const endDate = formatDate(endDateInput.value);
        const { headers, body } = getExportData();
        
        const dataToExport = body.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
        XLSX.writeFile(workbook, `reporte_${reportTypeSelect.value}_${startDate}_${endDate}.xlsx`);
    });

    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDateInput.value = formatDate(firstDayOfMonth);
    endDateInput.value = formatDate(today);
    
    reportTypeSelect.addEventListener('change', () => {
        if(reportTypeSelect.value === 'ai_financial_analysis') {
            showAiAnalysisView();
            aiAnalysisResult.innerHTML = '<p class="p-6 text-center text-gray-500">Seleccione un rango de fechas y genere el análisis para ver los resultados.</p>';
        } else {
            showRegularReportView();
            reportResults.innerHTML = '<p class="p-6 text-center text-gray-500">Seleccione los parámetros y genere un reporte para ver los resultados.</p>';
            paginationContainer.innerHTML = '';
        }
    });
});