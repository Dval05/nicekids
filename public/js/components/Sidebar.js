export const renderSidebar = async (container) => {
    try {
        const response = await fetch('/api/user/permissions');
        if (!response.ok) {
            // If permissions fail, redirect to login as a security measure
            window.location.href = '/';
            return;
        }
        const permissions = await response.json();
        const currentPath = window.location.pathname;

        const sidebarHTML = `
            <div class="flex flex-col w-64 bg-neutral text-gray-100 h-full">
                 <div class="flex items-center justify-center h-20 border-b border-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1H6a1 1 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3H6a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                    </svg>
                    <span class="ml-3 text-xl font-bold">NiceKids</span>
                </div>
                <div class="flex-1 overflow-y-auto p-4">
                    <nav class="space-y-2">
                        ${permissions.map(p => `
                            <a href="${p.Link}" class="flex items-center px-4 py-2.5 text-gray-200 transition-colors duration-200 rounded-lg hover:bg-primary-focus/50 ${currentPath === p.Link ? 'bg-primary-focus font-semibold' : ''}">
                                ${p.Icon || ''}
                                <span class="mx-4">${p.PermissionName}</span>
                            </a>
                        `).join('')}
                    </nav>
                </div>
            </div>
        `;
        container.innerHTML = sidebarHTML;
    } catch (error) {
        console.error('Failed to render sidebar:', error);
        container.innerHTML = '<div class="w-64 bg-neutral text-white p-4">Error loading navigation.</div>';
    }
};
