
import React from 'react';

const Activities: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Actividades</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Calendario de Actividades</h2>
        <p className="text-gray-500">
          Esta sección contendrá un calendario interactivo para que los profesores planifiquen y gestionen las actividades semanales.
          Las características incluirán añadir, editar y eliminar actividades para cada día de la semana.
        </p>
        <div className="mt-8 p-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-64">
          <p className="text-gray-400 font-medium">Componente de calendario próximamente.</p>
        </div>
      </div>
    </div>
  );
};

export default Activities;
