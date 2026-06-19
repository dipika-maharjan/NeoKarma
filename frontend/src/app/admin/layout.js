import AdminNavbar from '@/components/adminnavbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Admin - नेओकर्म'
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7f6] flex flex-col">
      <AdminNavbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
