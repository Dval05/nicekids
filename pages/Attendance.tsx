import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { AttendanceWithStudent, Student } from '../types';
import Spinner from '../components/Spinner';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const { userProfile } = useAuth();
  
  const canManageAttendance = userProfile?.role === 'Admin' || userProfile?.role === 'Teacher';

  const fetchAttendance = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`*, student:StudentID (FirstName, LastName, ProfilePicture)`)
        .eq('Date', date);
      if (error) throw error;

      const { data: allStudents, error: studentError } = await supabase
        .from('student')
        .select('*')
        .eq('IsActive', 1);
      if (studentError) throw studentError;
      
      setStudents(allStudents || []);
      setAttendance((attendanceData as any) || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate, fetchAttendance]);
  
  const handleCheckIn = async (studentId: number) => {
    const now = new Date();
    const { error } = await supabase.from('attendance').upsert({
        StudentID: studentId,
        Date: selectedDate,
        CheckInTime: now.toTimeString().split(' ')[0],
        Status: 'Present',
    }, { onConflict: 'StudentID, Date' });
    if (error) alert(error.message);
    else fetchAttendance(selectedDate);
  }
  
  const handleCheckOut = async (studentId: number, attendanceId: number) => {
      const now = new Date();
      const { error } = await supabase.from('attendance').update({
          CheckOutTime: now.toTimeString().split(' ')[0],
      }).eq('AttendanceID', attendanceId);
      if (error) alert(error.message);
      else fetchAttendance(selectedDate);
  }

  const getAttendanceForStudent = (studentId: number) => {
    return attendance.find(a => a.StudentID === studentId);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Asistencia</h1>
        <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading && <div className="p-4 flex justify-center"><Spinner /></div>}
        {error && <div className="p-4 text-red-600 bg-red-100">{error}</div>}
        {!loading && !error && (
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => {
                  const record = getAttendanceForStudent(student.StudentID);
                  return (
                    <tr key={student.StudentID}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.FirstName} {student.LastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record?.CheckInTime || ' - '}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record?.CheckOutTime || ' - '}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {record ? 'Presente' : 'Ausente'}
                        </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {canManageAttendance && !record && <button onClick={() => handleCheckIn(student.StudentID)} className="bg-green-500 text-white px-3 py-1 text-xs rounded hover:bg-green-600">Registrar Entrada</button>}
                        {canManageAttendance && record && !record.CheckOutTime && <button onClick={() => handleCheckOut(student.StudentID, record.AttendanceID)} className="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600">Registrar Salida</button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;