export const renderHeader = async (container) => {
    try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const profile = await response.json();

        const headerHTML = `
            <div class="flex justify-between items-center p-6 bg-white border-b h-full">
                <div>
                    <!-- Could add breadcrumbs or page title here dynamically -->
                </div>
                <div class="flex items-center space-x-6">
                    <div class="relative">
                        <button id="notification-button" class="relative text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span id="notification-badge" class="hidden absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"></span>
                        </button>
                        <div id="notification-panel" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border">
                            <div class="p-3 flex justify-between items-center border-b">
                                <h3 class="font-semibold text-gray-700">Notificaciones</h3>
                                <button id="mark-all-read-btn" class="text-xs text-primary hover:underline">Marcar todas como leídas</button>
                            </div>
                            <div id="notification-list" class="max-h-96 overflow-y-auto">
                                <!-- Notifications will be injected here -->
                            </div>
                        </div>
                    </div>
                     <div class="text-right">
                        <div class="font-semibold text-gray-800">${profile.firstName || ''} ${profile.lastName || ''}</div>
                        <div class="text-sm text-gray-500">${profile.role}</div>
                     </div>
                    <button id="logout-button" class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-focus">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = headerHTML;

        // --- Event Listeners and Logic ---
        const logoutButton = document.getElementById('logout-button');
        const notificationButton = document.getElementById('notification-button');
        const notificationPanel = document.getElementById('notification-panel');
        const notificationBadge = document.getElementById('notification-badge');
        const notificationList = document.getElementById('notification-list');
        const markAllReadBtn = document.getElementById('mark-all-read-btn');

        // Logout
        logoutButton.addEventListener('click', async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        });

        // Toggle notification panel
        notificationButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = notificationPanel.classList.toggle('hidden');
            if (!isHidden) {
                fetchNotifications();
            }
        });
        document.addEventListener('click', () => notificationPanel.classList.add('hidden'));
        notificationPanel.addEventListener('click', (e) => e.stopPropagation());

        // Fetch unread count
        const fetchUnreadCount = async () => {
            try {
                const res = await fetch('/api/notifications/count');
                if (res.ok) {
                    const { count } = await res.json();
                    if (count > 0) {
                        notificationBadge.textContent = count;
                        notificationBadge.classList.remove('hidden');
                    } else {
                        notificationBadge.classList.add('hidden');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        // Fetch and display notifications
        const fetchNotifications = async () => {
            notificationList.innerHTML = '<p class="p-4 text-sm text-center text-gray-500">Cargando...</p>';
            try {
                const res = await fetch('/api/notifications');
                const notifications = await res.json();
                if (notifications.length === 0) {
                    notificationList.innerHTML = '<p class="p-4 text-sm text-center text-gray-500">No hay notificaciones nuevas.</p>';
                } else {
                    notificationList.innerHTML = notifications.map(n => {
                        const isMessage = n.Type === 'Message';
                        const link = isMessage ? '/communications' : (n.RelatedModule ? `/${n.RelatedModule}` : '#');
                        const icon = isMessage 
                            ? `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`
                            : `<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>`;

                        return `
                            <a href="${link}" class="notification-item block p-3 hover:bg-gray-50 border-b last:border-b-0 ${!n.IsRead ? 'bg-blue-50' : ''}" data-id="${n.NotificationID}">
                                <div class="flex items-start">
                                    <div class="flex-shrink-0 mt-1">${icon}</div>
                                    <div class="ml-3 w-0 flex-1">
                                        <p class="text-sm text-gray-700">${n.Message}</p>
                                        <p class="text-xs text-gray-400 mt-1">${new Date(n.CreatedAt).toLocaleString('es-EC')}</p>
                                    </div>
                                </div>
                            </a>
                        `;
                    }).join('');
                }
            } catch (error) {
                notificationList.innerHTML = '<p class="p-4 text-sm text-center text-red-500">Error al cargar.</p>';
            }
        };

        // Mark all as read
        markAllReadBtn.addEventListener('click', async () => {
            await fetch('/api/notifications/read/all', { method: 'PUT' });
            fetchUnreadCount();
            fetchNotifications();
        });

        // Mark single as read on click
        notificationList.addEventListener('click', async (e) => {
            const item = e.target.closest('.notification-item');
            if (item) {
                const id = item.dataset.id;
                await fetch(`/api/notifications/read/${id}`, { method: 'PUT' });
                // No need to manually refresh count, let the navigation and re-render handle it
            }
        });

        // Initial fetch and polling
        fetchUnreadCount();
        setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        document.addEventListener('unreadCountChanged', fetchUnreadCount); // Listen for instant refresh event

    } catch (error) {
        console.error('Failed to render header:', error);
        container.innerHTML = '<div class="p-6 bg-white border-b">Error loading header.</div>';
    }
};