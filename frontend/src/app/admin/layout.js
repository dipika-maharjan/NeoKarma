import AdminNavbar from '@/components/adminnavbar';

export const metadata = {
  title: 'Admin - नेओकर्म'
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <AdminNavbar />
      {children}
    </div>
  );
}
