import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { useDoctorAuthStore } from '../../store/doctorAuthStore';

interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const menuItems: MenuItem[] = [
  { path: '/medico', label: 'Inicio', icon: <HomeIcon /> },
  { path: '/medico/turnos', label: 'Mis turnos', icon: <CalendarIcon /> },
  { path: '/medico/disponibilidad', label: 'Disponibilidad', icon: <ClockIcon /> },
  { path: '/medico/perfil', label: 'Mi perfil', icon: <UserIcon /> },
];

export function DoctorLayout({ children }: { children: ReactNode }) {
  const { doctor, logout } = useDoctorAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/medico/login' });
  };

  const isActive = (path: string) => {
    if (path === '/medico') return location.pathname === '/medico';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">Elica Medico</h1>
        <p className="text-sm text-gray-500 mt-1">{doctor?.name}</p>
      </div>

      <nav className="mt-2 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center px-6 py-3 transition-colors ${
              isActive(item.path)
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="mr-3"><LogoutIcon /></span>
          Cerrar sesion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-primary-600">Elica Medico</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:text-gray-900"
          aria-label={sidebarOpen ? 'Cerrar menu' : 'Abrir menu'}
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-50 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
