document.addEventListener('DOMContentLoaded', () => {
    const updateForm = document.getElementById('force-update-form');
    const messageDiv = document.getElementById('message');
    const submitButton = document.getElementById('submit-button');

    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            messageDiv.classList.add('hidden');

            if (newPassword !== confirmPassword) {
                messageDiv.textContent = 'Las contraseñas no coinciden.';
                messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
                messageDiv.classList.remove('hidden');
                return;
            }

            if (newPassword.length < 6) {
                messageDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
                messageDiv.classList.remove('hidden');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Actualizando...';

            try {
                const response = await fetch('/api/auth/force-update-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al actualizar la contraseña.');
                }

                messageDiv.textContent = '¡Contraseña actualizada con éxito! Serás redirigido al panel principal.';
                messageDiv.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4';
                messageDiv.classList.remove('hidden');
                
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);

            } catch (error) {
                 messageDiv.textContent = error.message;
                 messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
                 messageDiv.classList.remove('hidden');
                 submitButton.disabled = false;
                 submitButton.textContent = 'Establecer Contraseña';
            }
        });
    }
});
