import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';
import ConfirmAccountView from './views/auth/ConfirmAccountView';
import RequestNewTokenView from './views/auth/RequestNewTokenView';
import ForgotPasswordView from './views/auth/ForgotPasswordView';
import ResetPasswordTokenView from './views/auth/ResetPasswordTokenView';
import NewPasswordView from './views/auth/NewPasswordView';
import HomeView from './views/HomeView';
import CatalogueView from './views/dashboard/CatalogueView';
import AuthorsView from './views/dashboard/AuthorsView';
import CategoriesView from './views/dashboard/CategoriesView';
import BookCopiesView from './views/dashboard/BookCopiesView';
import DashboardLayout from './layouts/DashboardLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Helper component for dashboard routes
const DashboardRoute = ({ children }: { children: React.ReactNode }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || 'estudiante';
  return <DashboardLayout role={role}>{children}</DashboardLayout>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/auth/login" element={<LoginView />} />
          <Route path="/auth/register" element={<RegisterView />} />
          <Route path="/auth/confirm" element={<ConfirmAccountView />} />
          <Route path="/auth/resend-token" element={<RequestNewTokenView />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/auth/reset-password" element={<ResetPasswordTokenView />} />
          <Route path="/auth/new-password" element={<NewPasswordView />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/catalogue" element={<DashboardRoute><CatalogueView /></DashboardRoute>} />
          <Route path="/dashboard/authors" element={<DashboardRoute><AuthorsView /></DashboardRoute>} />
          <Route path="/dashboard/categories" element={<DashboardRoute><CategoriesView /></DashboardRoute>} />
          <Route path="/dashboard/catalogue/:bookId/ejemplares" element={<DashboardRoute><BookCopiesView /></DashboardRoute>} />
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

export default App
