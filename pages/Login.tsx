import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const errorMessages: { [key: string]: string } = {
    'Invalid login credentials': 'Credenciales de inicio de sesión no válidas.',
    'User not found': 'Usuario no encontrado.',
    'Email not confirmed': 'Por favor, confirma tu correo electrónico para iniciar sesión.',
};

const translateError = (message: string): string => {
    return errorMessages[message] || 'Ocurrió un error. Por favor, inténtalo de nuevo.';
}

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { session } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      let emailToLogin = identifier;
      // Check if identifier is a username or an email
      if (!identifier.includes('@')) {
        // It's a username, so we need to get the email from the database
        const { data: userData, error: userError } = await supabase
          .from('user')
          .select('Email')
          .eq('UserName', identifier)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }
        emailToLogin = userData.Email;
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password,
      });
      if (signInError) throw signInError;
      // The onAuthStateChange listener in AuthContext will handle navigation.
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!identifier) {
      setError('Por favor, ingresa tu correo electrónico para restablecer la contraseña.');
      return;
    }
     if (!identifier.includes('@')) {
      setError('El restablecimiento de contraseña solo funciona con correo electrónico.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
          redirectTo: window.location.origin + '/#/', // Redirect to the app root after reset
      });
      if (error) throw error;
      setMessage('Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.');
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };
  
  if (session) {
      return <Navigate to="/" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0v-.5a1 1 0 00-1-1H6a1 1 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3H6a1 1 0 01-1-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                <h1 className="ml-3 text-3xl font-bold text-gray-800">NiceKids</h1>
            </div>
          <h2 className="mt-2 text-xl font-semibold text-gray-600">
            Bienvenido de vuelta
          </h2>
          <p className="text-sm text-gray-500">Inicia sesión para continuar</p>
        </div>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}
        {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert"><p>{message}</p></div>}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">Usuario o Correo Electrónico</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Usuario o Correo Electrónico"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-primary hover:text-primary-focus"
                disabled={loading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;