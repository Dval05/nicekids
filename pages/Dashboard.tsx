
import React, { useEffect, useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';
import Spinner from '../components/Spinner';

const Dashboard: React.FC = () => {
    const { userProfile } = useAuth();
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            const today = formatDate(new Date());

            // Get total students
            const { count: totalCount, error: totalError } = await supabase
                .from('student')
                .select('*', { count: 'exact', head: true })
                .eq('IsActive', 1);

            // Get today's attendance
            const { data: attendanceData, error: attendanceError } = await supabase
                .from('attendance')
                .select('Status')
                .eq('Date', today);
            
            if (totalError || attendanceError) {
                console.error('Error fetching dashboard data:', totalError || attendanceError);
                setLoading(false);
                return;
            }

            const present = attendanceData.filter(a => a.Status === 'Present').length;
            const total = totalCount ?? 0;

            setStats({
                present,
                absent: total - present,
                total,
            });
            setLoading(false);
        };

        fetchDashboardData();
    }, []);


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        ¡Bienvenido de vuelta, {userProfile?.firstName || userProfile?.email}!
      </h1>
      
      {loading ? (
        <div className="flex justify-center items-center p-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Total de Estudiantes" value={stats.total.toString()} icon={<UsersIcon />} color="bg-blue-100 text-blue-600" />
            <DashboardCard title="Presentes Hoy" value={stats.present.toString()} icon={<CheckCircleIcon />} color="bg-green-100 text-green-600" />
            <DashboardCard title="Ausentes Hoy" value={stats.absent.toString()} icon={<XCircleIcon />} color="bg-red-100 text-red-600" />
        </div>
      )}

      {/* Placeholder for more dashboard components */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Próximas Actividades</h2>
              <p className="text-gray-500">El calendario de actividades se mostrará aquí.</p>
          </div>
           <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Observaciones Recientes</h2>
              <p className="text-gray-500">La lista de observaciones recientes de los estudiantes se mostrará aquí.</p>
          </div>
      </div>
    </div>
  );
};


// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;

export default Dashboard;
