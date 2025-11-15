document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('identifier').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error-message');
            const loginButton = document.getElementById('login-button');

            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
            loginButton.disabled = true;
            loginButton.textContent = 'Ingresando...';

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ identifier, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.firstLogin) {
                        window.location.href = '/force-update-password';
                    } else {
                        window.location.href = '/dashboard';
                    }
                } else {
                    let errorMessage = 'Usuario/Correo o contraseña no válidos.';
                    if (data.message && data.message.toLowerCase().includes('invalid login credentials')) {
                       errorMessage = 'Usuario/Correo o contraseña no válidos.';
                    }
                    errorDiv.textContent = errorMessage;
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.textContent = 'Ocurrió un error de red. Por favor, inténtalo de nuevo.';
                errorDiv.classList.remove('hidden');
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Iniciar Sesión';
            }
        });
    }
});