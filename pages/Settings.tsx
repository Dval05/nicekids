
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Settings: React.FC = () => {
  const { userProfile } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuración</h1>
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Perfil de Usuario</h2>
        {userProfile ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
              <p className="text-md text-gray-900">{userProfile.firstName} {userProfile.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
              <p className="text-md text-gray-900">{userProfile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rol</label>
              <p className="text-md text-gray-900">{userProfile.role}</p>
            </div>
          </div>
        ) : (
          <p>Cargando perfil...</p>
        )}
      </div>
    </div>
  );
};

export default Settings;
