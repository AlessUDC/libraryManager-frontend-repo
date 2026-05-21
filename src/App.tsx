import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import ConfirmAccountView from './views/auth/ConfirmAccountView';
import RequestNewTokenView from './views/auth/RequestNewTokenView';
import ForgotPasswordView from './views/auth/ForgotPasswordView';
import ResetPasswordTokenView from './views/auth/ResetPasswordTokenView';
import NewPasswordView from './views/auth/NewPasswordView';
import ActivateAccountView from './views/auth/ActivateAccountView';
import CatalogueView from './views/dashboard/CatalogueView';
import AuthorsView from './views/dashboard/AuthorsView';
import CategoriesView from './views/dashboard/CategoriesView';
import BookCopiesView from './views/dashboard/BookCopiesView';
import ExploreBooksView from './views/dashboard/ExploreBooksView';
import MyLoansView from './views/dashboard/MyLoansView';
import MyReservationsView from './views/dashboard/MyReservationsView';
import BookFormView from './views/dashboard/BookFormView';
import AuthorFormView from './views/dashboard/AuthorFormView';
import UsersView from './views/dashboard/UsersView';
import UserFormView from './views/dashboard/UserFormView';
import LoansView from './views/dashboard/LoansView';
import NotFoundView from './views/NotFoundView';
import AdminStatsView from './views/dashboard/AdminStatsView';
import StudentDashboard from './views/dashboard/StudentDashboard';
import TeacherDashboard from './views/dashboard/TeacherDashboard';
import FinesAndAppealsView from './views/dashboard/FinesAndAppealsView';
import ManageAppealsView from './views/dashboard/ManageAppealsView';
import AuditLogsView from './views/dashboard/AuditLogsView';
import DashboardLayout from './layouts/DashboardLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Helper component for dashboard routes
interface DashboardRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const DashboardRoute = ({ children, allowedRoles }: DashboardRouteProps) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  if (!token || token === 'undefined') {
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = (user?.role || 'STUDENT').toUpperCase();
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout role={userRole}>{children}</DashboardLayout>;
};

function App() {
  const adminLibrarian = ['ADMINISTRATOR', 'LIBRARIAN'];
  const allRoles = ['STUDENT', 'TEACHER', 'LIBRARIAN', 'ADMINISTRATOR'];

  const DashboardSwitcher = () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const role = (user?.role || 'STUDENT').toUpperCase();

    if (role === 'ADMINISTRATOR' || role === 'LIBRARIAN') return <AdminStatsView />;
    if (role === 'TEACHER') return <TeacherDashboard />;
    return <StudentDashboard />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardRoute allowedRoles={allRoles}><DashboardSwitcher /></DashboardRoute>} />
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/confirm" element={<ConfirmAccountView />} />
          <Route path="/auth/resend-token" element={<RequestNewTokenView />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/auth/reset-password" element={<ResetPasswordTokenView />} />
          <Route path="/auth/new-password" element={<NewPasswordView />} />
          <Route path="/auth/activate/:token" element={<ActivateAccountView />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/catalogue" element={<DashboardRoute allowedRoles={adminLibrarian}><CatalogueView /></DashboardRoute>} />
          <Route path="/catalogue/create" element={<DashboardRoute allowedRoles={adminLibrarian}><BookFormView /></DashboardRoute>} />
          <Route path="/catalogue/:slug/edit" element={<DashboardRoute allowedRoles={adminLibrarian}><BookFormView /></DashboardRoute>} />
          
          <Route path="/authors" element={<DashboardRoute allowedRoles={adminLibrarian}><AuthorsView /></DashboardRoute>} />
          <Route path="/authors/create" element={<DashboardRoute allowedRoles={adminLibrarian}><AuthorFormView /></DashboardRoute>} />
          <Route path="/authors/:slug/edit" element={<DashboardRoute allowedRoles={adminLibrarian}><AuthorFormView /></DashboardRoute>} />
          
          <Route path="/categories" element={<DashboardRoute allowedRoles={adminLibrarian}><CategoriesView /></DashboardRoute>} />
          <Route path="/catalogue/:slug/ejemplares" element={<DashboardRoute allowedRoles={allRoles}><BookCopiesView /></DashboardRoute>} />
          
          <Route path="/explore" element={<DashboardRoute allowedRoles={allRoles}><ExploreBooksView /></DashboardRoute>} />
          <Route path="/loans" element={<DashboardRoute allowedRoles={allRoles}><MyLoansView /></DashboardRoute>} />
          <Route path="/reservations" element={<DashboardRoute allowedRoles={allRoles}><MyReservationsView /></DashboardRoute>} />
          <Route path="/manage-loans" element={<DashboardRoute allowedRoles={adminLibrarian}><LoansView /></DashboardRoute>} />
          
          <Route path="/fines-appeals" element={<DashboardRoute allowedRoles={allRoles}><FinesAndAppealsView /></DashboardRoute>} />
          <Route path="/manage-appeals" element={<DashboardRoute allowedRoles={adminLibrarian}><ManageAppealsView /></DashboardRoute>} />
          <Route path="/audit-logs" element={<DashboardRoute allowedRoles={['ADMINISTRATOR']}><AuditLogsView /></DashboardRoute>} />

          <Route path="/users" element={<DashboardRoute allowedRoles={['ADMINISTRATOR']}><UsersView /></DashboardRoute>} />
          <Route path="/users/create" element={<DashboardRoute allowedRoles={['ADMINISTRATOR']}><UserFormView /></DashboardRoute>} />
          <Route path="/users/:slug/edit" element={<DashboardRoute allowedRoles={['ADMINISTRATOR']}><UserFormView /></DashboardRoute>} />

          <Route path="*" element={<NotFoundView />} />
        </Routes>

        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
