


import React, { useState, useEffect } from 'react';
import type { Database, Student } from '../types';
import { supabase } from '../services/supabase';
import { validateEcuadorianId } from '../utils/helpers';

interface StudentFormProps {
  student: Student | null;
  onSave: (student: Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    FirstName: '',
    LastName: '',
    BirthDate: '',
    DocumentNumber: '',
    IsActive: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        BirthDate: student.BirthDate ? new Date(student.BirthDate).toISOString().split('T')[0] : '',
      });
    } else {
        setFormData({
            FirstName: '',
            LastName: '',
            BirthDate: '',
            DocumentNumber: '',
            IsActive: 1,
        });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked ? 1: 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Ecuadorian ID validation
    if (formData.DocumentNumber && !validateEcuadorianId(formData.DocumentNumber)) {
        setError('El número de Cédula ingresado no es válido.');
        return;
    }

    setLoading(true);
    try {
      let savedStudent: Student;
      if (student?.StudentID) {
        // Update
        // FIX: The update payload was invalid. `UpdatedAt` is not in the schema, and `StudentID` should not be in the update payload.
        // This creates a valid payload for the update operation by removing the StudentID.
        const { StudentID, ...updateData } = formData;
        const { data, error } = await supabase
          .from('student')
          .update(updateData)
          .eq('StudentID', student.StudentID)
          .select()
          .single();
        if (error) throw error;
        savedStudent = data;
      } else {
        // Create
        // FIX: The `formData` is of type `Partial<Student>`, which is not assignable to
        // the `insert` method's parameter type that requires certain fields to be non-optional.
        // The form enforces these fields with `required` attributes, making it safe to cast
        // the `formData` to the expected insert type to resolve the type error.
        const { data, error } = await supabase
          .from('student')
          .insert(formData as unknown as Database['public']['Tables']['student']['Insert'])
          .select()
          .single();
        if (error) throw error;
        savedStudent = data;
      }
      onSave(savedStudent);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700">Nombres</label>
            <input
                type="text"
                name="FirstName"
                id="FirstName"
                value={formData.FirstName || ''}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="LastName" className="block text-sm font-medium text-gray-700">Apellidos</label>
            <input
                type="text"
                name="LastName"
                id="LastName"
                value={formData.LastName || ''}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
      </div>
      <div>
        <label htmlFor="BirthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
        <input
            type="date"
            name="BirthDate"
            id="BirthDate"
            value={formData.BirthDate || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
       <div>
        <label htmlFor="DocumentNumber" className="block text-sm font-medium text-gray-700">Cédula (Opcional)</label>
        <input
            type="text"
            name="DocumentNumber"
            id="DocumentNumber"
            value={formData.DocumentNumber || ''}
            onChange={handleChange}
            maxLength={10}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        />
      </div>
       <div className="flex items-center">
        <input
            id="IsActive"
            name="IsActive"
            type="checkbox"
            checked={formData.IsActive === 1}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="IsActive" className="ml-2 block text-sm text-gray-900">Activo</label>
    </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;