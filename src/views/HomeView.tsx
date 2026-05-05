import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import TeacherDashboard from './dashboard/TeacherDashboard';
import StudentDashboard from './dashboard/StudentDashboard';

export default function HomeView() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/login');
    }
  }, [navigate]);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || 'estudiante'; // Default to estudiante if not set

  return (
    <DashboardLayout role={role}>
      {role === 'docente' ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </DashboardLayout>
  );
}
