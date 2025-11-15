import { createClient } from '@supabase/supabase-js';

// These credentials must be exposed client-side for the Supabase JS library to function.
// This is standard practice and secure, as it's the 'anon' key, not a private secret.
const SUPABASE_URL = 'https://dkfissjbxaevmxcqvpai.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzQ3NjIsImV4cCI6MjA3ODY1MDc2Mn0.jvhYLRPvgkOa-Yx4So9-b3MfouLoRl9f-iHgkldxEcI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const updatePasswordForm = document.getElementById('update-password-form');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const messageDiv = document.getElementById('message');
            const submitButton = document.getElementById('submit-button');

            messageDiv.classList.add('hidden');
            messageDiv.textContent = '';
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            messageDiv.textContent = data.message;
            if (response.ok) {
                messageDiv.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4';
                document.getElementById('email').value = '';
            } else {
                 messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
            }
            messageDiv.classList.remove('hidden');

            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Enlace';
        });
    }

    if (updatePasswordForm) {
        updatePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const messageDiv = document.getElementById('message');
            const submitButton = document.getElementById('submit-button');
            
            messageDiv.classList.add('hidden');

            if (password !== confirmPassword) {
                messageDiv.textContent = 'Las contraseñas no coinciden.';
                messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
                messageDiv.classList.remove('hidden');
                return;
            }

            if (password.length < 6) {
                messageDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
                messageDiv.classList.remove('hidden');
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Actualizando...';

            // The Supabase client automatically uses the access_token from the URL fragment
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                messageDiv.textContent = 'Error: El enlace puede ser inválido o haber expirado. ' + error.message;
                messageDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
                messageDiv.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Actualizar Contraseña';
            } else {
                messageDiv.textContent = '¡Contraseña actualizada con éxito! Serás redirigido para iniciar sesión.';
                messageDiv.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4';
                messageDiv.classList.remove('hidden');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            }
        });
    }
});