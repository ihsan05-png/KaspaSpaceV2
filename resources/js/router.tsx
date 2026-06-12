import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './layouts/AppLayout';
import Home from './pages/Home';
import About from './pages/About';
import ContactPage from './pages/ContactPage';
import CoworkingPage from './pages/CoworkingPage';
import FnBPage from './pages/FnBPage';
import BusinessServicePage from './pages/BusinessServicePage';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminRooms from './admin/pages/AdminRooms';
import AdminBookings from './admin/pages/AdminBookings';
import AdminMembers from './admin/pages/AdminMembers';
import AdminLaporan from './admin/pages/AdminLaporan';
import AdminSettings from './admin/pages/AdminSettings';
import AdminProducts from './admin/pages/AdminProducts';
import AdminDiskon from './admin/pages/AdminDiskon';
import AdminReview from './admin/pages/AdminReview';
import AdminArticles from './admin/pages/AdminArticles';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MediaPage from './pages/MediaPage';
import InvoicePage from './pages/InvoicePage';

function PublicGuard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
    {
        element: <PublicGuard />,
        children: [{
            path: '/',
            element: <Layout />,
            children: [
                { index: true, element: <Home /> },
                { path: 'tentang', element: <About /> },
                { path: 'kontak', element: <ContactPage /> },
                { path: 'coworking', element: <CoworkingPage /> },
                { path: 'fnb', element: <FnBPage /> },
                { path: 'bisnis', element: <BusinessServicePage /> },
                { path: 'masuk', element: <AuthPage /> },
                { path: 'produk', element: <ProductDetailPage /> },
                { path: 'checkout', element: <CheckoutPage /> },
                { path: 'payment', element: <PaymentPage /> },
                { path: 'sukses', element: <OrderSuccessPage /> },
                { path: 'dashboard',    element: <DashboardPage /> },
                { path: 'pesan',        element: <BookingPage /> },
                { path: 'pesan-sukses', element: <BookingSuccessPage /> },
                { path: 'media',        element: <MediaPage /> },
            ],
        }],
    },
    { path: 'invoice', element: <InvoicePage /> },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'produk', element: <AdminProducts /> },
            { path: 'ruangan', element: <AdminRooms /> },
            { path: 'booking', element: <AdminBookings /> },
            { path: 'diskon', element: <AdminDiskon /> },
            { path: 'ulasan', element: <AdminReview /> },
            { path: 'member', element: <AdminMembers /> },
            { path: 'laporan', element: <AdminLaporan /> },
            { path: 'pengaturan', element: <AdminSettings /> },
            { path: 'artikel',    element: <AdminArticles /> },
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default router;
