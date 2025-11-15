import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Student } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import { useAuth } from '../hooks/useAuth';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { userProfile } = useAuth();
  
  const isAdmin = userProfile?.role === 'Admin';
  const isTeacher = userProfile?.role === 'Teacher';


  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('student')
        .select('*')
        .order('LastName', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    // FIX: Added curly braces to the catch block to fix syntax error.
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = () => {
    setIsModalOpen(false);
    fetchStudents(); // Refresh the list
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar a este estudiante? (Esto es una eliminación lógica)')) {
        // Logical delete
        const { error } = await supabase
            .from('student')
            .update({ IsActive: 0 })
            .eq('StudentID', studentId);
        
        if (error) {
            alert('Error al desactivar estudiante: ' + error.message);
        } else {
            fetchStudents();
        }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Estudiantes</h1>
        {isAdmin && (
            <button
              onClick={handleAddStudent}
              className="bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary-focus transition-colors"
            >
              Añadir Estudiante
            </button>
        )}
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading && <div className="p-4 flex justify-center"><Spinner /></div>}
        {error && <div className="p-4 text-red-600 bg-red-100">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.StudentID}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.FirstName} {student.LastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.DocumentNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.BirthDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {student.IsActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {(isAdmin || isTeacher) && <button onClick={() => handleEditStudent(student)} className="text-primary hover:text-primary-focus">Editar</button>}
                      {isAdmin && <button onClick={() => handleDeleteStudent(student.StudentID)} className="text-error hover:text-red-700">Desactivar</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedStudent ? 'Editar Estudiante' : 'Añadir Nuevo Estudiante'}>
        <StudentForm student={selectedStudent} onSave={handleSaveStudent} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Students;