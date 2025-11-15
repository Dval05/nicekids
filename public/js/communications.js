document.addEventListener('DOMContentLoaded', () => {
    const userListContainer = document.getElementById('user-list-container');
    const chatArea = document.getElementById('chat-area');
    const initialMessage = document.getElementById('initial-message');
    const chatContent = document.getElementById('chat-content');
    const chatHeader = document.getElementById('chat-header');
    const messageContainer = document.getElementById('message-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    let currentUserId = null;
    let selectedUserId = null;

    const renderUserList = (users, myId) => {
        currentUserId = myId;
        if (!users.length) {
            userListContainer.innerHTML = '<p class="p-4 text-center text-gray-500">No hay otros usuarios.</p>';
            return;
        }
        userListContainer.innerHTML = users.map(user => `
            <div class="flex items-center p-3 hover:bg-gray-100 cursor-pointer user-item" data-user-id="${user.UserID}">
                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-3">
                    ${user.FirstName ? user.FirstName[0] : ''}${user.LastName ? user.LastName[0] : ''}
                </div>
                <div>
                    <p class="font-semibold text-gray-800">${user.FirstName} ${user.LastName}</p>
                    <p class="text-sm text-gray-500">${user.Position}</p>
                </div>
            </div>
        `).join('');
    };

    const renderMessages = (messages) => {
        messageContainer.innerHTML = messages.map(msg => {
            const isSender = msg.SenderID === currentUserId;
            return `
                <div class="flex ${isSender ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-xs md:max-w-md px-4 py-2 rounded-xl ${isSender ? 'bg-primary text-white' : 'bg-white shadow'}">
                        <p>${msg.Message}</p>
                        <p class="text-xs mt-1 text-right ${isSender ? 'text-gray-200' : 'text-gray-400'}">${new Date(msg.CreatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            `;
        }).join('');
        // Scroll to bottom
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/communications/users');
            if (response.ok) {
                const { users, currentUserId } = await response.json();
                renderUserList(users, currentUserId);
            } else {
                userListContainer.innerHTML = '<p class="p-4 text-center text-red-500">Error al cargar usuarios.</p>';
            }
        } catch (error) {
            console.error(error);
            userListContainer.innerHTML = '<p class="p-4 text-center text-red-500">Error de red.</p>';
        }
    };
    
    const fetchHistoryAndOpenChat = async (otherUserId, otherUserName) => {
        selectedUserId = otherUserId;
        
        // Update UI
        initialMessage.classList.add('hidden');
        chatContent.classList.remove('hidden');
        chatHeader.innerHTML = `<h3 class="text-lg font-semibold">${otherUserName}</h3>`;
        messageContainer.innerHTML = '<p class="text-center text-gray-500">Cargando historial...</p>';

        // Mark messages as read
        await fetch(`/api/communications/read/${otherUserId}`, { method: 'PUT' });
        // Notify header to update badge
        document.dispatchEvent(new CustomEvent('unreadCountChanged'));


        try {
            const response = await fetch(`/api/communications/history/${otherUserId}`);
            if (response.ok) {
                const messages = await response.json();
                renderMessages(messages);
            } else {
                messageContainer.innerHTML = '<p class="text-center text-red-500">Error al cargar el historial.</p>';
            }
        } catch (error) {
            console.error(error);
            messageContainer.innerHTML = '<p class="text-center text-red-500">Error de red.</p>';
        }
    };
    
    userListContainer.addEventListener('click', (e) => {
        const userItem = e.target.closest('.user-item');
        if (userItem) {
            // Un-select others
            document.querySelectorAll('.user-item').forEach(el => el.classList.remove('bg-gray-200'));
            // Select this one
            userItem.classList.add('bg-gray-200');

            const userId = userItem.dataset.userId;
            const userName = userItem.querySelector('p.font-semibold').textContent;
            fetchHistoryAndOpenChat(userId, userName);
        }
    });

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message || !selectedUserId) return;

        sendButton.disabled = true;
        messageInput.disabled = true;

        try {
            const response = await fetch('/api/communications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUserId,
                    message: message,
                })
            });
            if (response.ok) {
                messageInput.value = '';
                // Refresh history
                const selectedUserEl = document.querySelector(`.user-item[data-user-id='${selectedUserId}']`);
                const userName = selectedUserEl.querySelector('p.font-semibold').textContent;
                fetchHistoryAndOpenChat(selectedUserId, userName);
            } else {
                alert('Error al enviar el mensaje.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de red al enviar el mensaje.');
        } finally {
            sendButton.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
        }
    });


    // Initial Load
    fetchUsers();
});