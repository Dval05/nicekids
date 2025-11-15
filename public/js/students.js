document.addEventListener('DOMContentLoaded', () => {
    const tableContainer = document.getElementById('table-container');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const modal = document.getElementById('student-modal');
    const addStudentButton = document.getElementById('add-student-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelButton = document.getElementById('cancel-button');
    const studentForm = document.getElementById('student-form');
    const modalTitle = document.getElementById('modal-title');
    const formError = document.getElementById('form-error');
    const saveButton = document.getElementById('save-button');
    const gradeSelect = document.getElementById('GradeID');
    const guardianSelect = document.getElementById('GuardianID');

    let allStudents = [];
    let allGrades = [];
    let allGuardians = [];
    let filteredStudents = [];
    let currentPage = 1;
    const rowsPerPage = 10;
    let sortColumn = 'LastName';
    let sortDirection = 'asc';

    const openModal = (title) => {
        modalTitle.textContent = title;
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        studentForm.reset();
        document.getElementById('student-id').value = '';
        formError.classList.add('hidden');
        formError.textContent = '';
    };
    
    const sortData = () => {
        filteredStudents.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            // Handle nested properties for sorting
            if (sortColumn === 'GradeName') {
                aValue = a.grade?.GradeName || '';
                bValue = b.grade?.GradeName || '';
            }

            if (sortColumn === 'GuardianName') {
                aValue = a.guardian ? `${a.guardian.FirstName} ${a.guardian.LastName}` : '';
                bValue = b.guardian ? `${b.guardian.FirstName} ${b.guardian.LastName}` : '';
            }

            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';

            // Case-insensitive string comparison
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    };
    
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value; // 'all', 'active', 'inactive'

        filteredStudents = allStudents.filter(student => {
            // Status filter
            if (statusValue === 'active' && student.IsActive !== 1) {
                return false;
            }
            if (statusValue === 'inactive' && student.IsActive !== 0) {
                return false;
            }

            // Search term filter
            const fullName = `${student.FirstName} ${student.LastName}`.toLowerCase();
            const documentNumber = student.DocumentNumber || '';
            const gradeName = student.grade?.GradeName.toLowerCase() || '';
            const guardianName = student.guardian ? `${student.guardian.FirstName} ${student.guardian.LastName}`.toLowerCase() : '';
            return fullName.includes(searchTerm) || 
                   documentNumber.includes(searchTerm) || 
                   gradeName.includes(searchTerm) ||
                   guardianName.includes(searchTerm);
        });
        sortData();
        renderPage(1);
    };

    const renderTable = () => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedStudents = filteredStudents.slice(start, end);

        if (paginatedStudents.length === 0 && allStudents.length > 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No se encontraron estudiantes que coincidan con los filtros.</p>`;
            return;
        }
         if (allStudents.length === 0) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-gray-500">No hay estudiantes registrados.</p>`;
            return;
        }

        const getSortIndicator = (column) => {
            if (column === sortColumn) {
                return sortDirection === 'asc' ? '▲' : '▼';
            }
            return '';
        };

        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        table.innerHTML = `
            <thead class="bg-gray-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="LastName">Nombre ${getSortIndicator('LastName')}</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="GradeName">Grado ${getSortIndicator('GradeName')}</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="GuardianName">Responsable ${getSortIndicator('GuardianName')}</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" data-sort="IsActive">Estado ${getSortIndicator('IsActive')}</th>
                    <th scope="col" class="relative px-6 py-3"><span class="sr-only">Acciones</span></th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${paginatedStudents.map(student => `
                    <tr data-id="${student.StudentID}">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${student.FirstName} ${student.LastName}</div>
                            <div class="text-sm text-gray-500">${student.DocumentNumber || 'Sin cédula'}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.grade?.GradeName || 'Sin grado'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.guardian ? `${student.guardian.FirstName} ${student.guardian.LastName}` : 'Sin asignar'}</td>

                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${student.IsActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button class="text-primary hover:text-primary-focus edit-button" data-student='${JSON.stringify(student)}'>Editar</button>
                            <button class="text-error hover:text-red-700 delete-button" data-id="${student.StudentID}">Desactivar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    };

    const renderPagination = () => {
        const pageCount = Math.ceil(filteredStudents.length / rowsPerPage);
        const startRecord = filteredStudents.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
        const endRecord = Math.min(currentPage * rowsPerPage, filteredStudents.length);

        if (pageCount <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let pageButtons = '';
        // Basic pagination logic to avoid showing too many page numbers
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(pageCount, startPage + maxButtons - 1);
        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === currentPage ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50';
            pageButtons += `<button class="px-3 py-1 border border-gray-300 rounded-md text-sm page-btn" data-page="${i}">${i}</button>`;
        }

        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        const nextDisabled = currentPage === pageCount ? 'disabled' : '';

        paginationContainer.innerHTML = `
            <div class="text-sm text-gray-700">
                Mostrando <span class="font-medium">${startRecord}</span> a <span class="font-medium">${endRecord}</span> de <span class="font-medium">${filteredStudents.length}</span> resultados
            </div>
            <div class="flex items-center space-x-1">
                <button class="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 prev-btn" ${prevDisabled}>Anterior</button>
                ${pageButtons}
                <button class="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-700 hover:bg-gray-50 next-btn" ${nextDisabled}>Siguiente</button>
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
            const [studentsRes, gradesRes, guardiansRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/grades'),
                fetch('/api/guardians')
            ]);
            if (!studentsRes.ok || !gradesRes.ok || !guardiansRes.ok) throw new Error('Network response was not ok');
            
            allStudents = await studentsRes.json();
            allGrades = await gradesRes.json();
            allGuardians = await guardiansRes.json();

            // Populate select dropdowns
            gradeSelect.innerHTML = '<option value="">Seleccione un grado</option>' + allGrades.filter(g => g.IsActive).map(g => `<option value="${g.GradeID}">${g.GradeName}</option>`).join('');
            guardianSelect.innerHTML = '<option value="">Seleccione un responsable</option>' + allGuardians.map(g => `<option value="${g.GuardianID}">${g.FirstName} ${g.LastName}</option>`).join('');

            applyFilters();
        } catch (error) {
            tableContainer.innerHTML = `<p class="p-4 text-center text-red-500">Error al cargar los datos.</p>`;
            console.error('Error fetching data:', error);
        }
    };

    addStudentButton.addEventListener('click', () => {
        openModal('Añadir Nuevo Estudiante');
        document.getElementById('IsActive').checked = true;
    });

    closeModalButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => e.target === modal && closeModal());

    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.disabled = true;
        saveButton.textContent = 'Guardando...';

        const formData = new FormData(studentForm);
        const studentId = formData.get('StudentID');
        const studentData = {
            FirstName: formData.get('FirstName'),
            LastName: formData.get('LastName'),
            BirthDate: formData.get('BirthDate'),
            DocumentNumber: formData.get('DocumentNumber'),
            GradeID: formData.get('GradeID') ? parseInt(formData.get('GradeID')) : null,
            GuardianID: formData.get('GuardianID') ? parseInt(formData.get('GuardianID')) : null,
            IsActive: document.getElementById('IsActive').checked ? 1 : 0,
        };

        const method = studentId ? 'PUT' : 'POST';
        const url = studentId ? `/api/students/${studentId}` : '/api/students';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save student');
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

    tableContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'TH') {
            const newSortColumn = target.dataset.sort;
            if (sortColumn === newSortColumn) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = newSortColumn;
                sortDirection = 'asc';
            }
            applyFilters();
        }

        if (target.classList.contains('edit-button')) {
            const student = JSON.parse(target.dataset.student);
            openModal('Editar Estudiante');
            document.getElementById('student-id').value = student.StudentID;
            document.getElementById('FirstName').value = student.FirstName;
            document.getElementById('LastName').value = student.LastName;
            document.getElementById('BirthDate').value = student.BirthDate ? student.BirthDate.split('T')[0] : '';
            document.getElementById('DocumentNumber').value = student.DocumentNumber || '';
            document.getElementById('GradeID').value = student.GradeID || '';
            document.getElementById('GuardianID').value = student.GuardianID || '';
            document.getElementById('IsActive').checked = student.IsActive === 1;
        }

        if (target.classList.contains('delete-button')) {
            const studentId = target.dataset.id;
            if (confirm('¿Estás seguro de que quieres desactivar a este estudiante?')) {
                fetch(`/api/students/${studentId}`, { method: 'DELETE' })
                    .then(response => {
                        if (response.ok) {
                            fetchInitialData();
                        } else {
                            alert('Error al desactivar el estudiante.');
                        }
                    });
            }
        }
    });
    
    paginationContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('page-btn')) {
            const page = parseInt(target.dataset.page);
            if (page !== currentPage) renderPage(page);
        } else if (target.classList.contains('prev-btn')) {
            if (currentPage > 1) renderPage(currentPage - 1);
        } else if (target.classList.contains('next-btn')) {
            const pageCount = Math.ceil(filteredStudents.length / rowsPerPage);
            if (currentPage < pageCount) renderPage(currentPage + 1);
        }
    });

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    fetchInitialData();
});