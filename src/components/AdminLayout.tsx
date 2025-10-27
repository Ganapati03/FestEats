import { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';

const getInitialSidebarState = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebarState);
  const [isDesktop, setIsDesktop] = useState(getInitialSidebarState);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      setSidebarOpen(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    setSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    }
    return () => {
      if (!isDesktop) {
        document.body.style.overflow = '';
      }
    };
  }, [sidebarOpen, isDesktop]);

  return (
    <>
      <AdminNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isDesktop={isDesktop}
      />

      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-x-0 top-[56px] bottom-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen bg-gray-50 pt-[56px] md:pt-0">
        <AdminSidebar />
        <main
          className={`
            flex-1 p-8 transition-all duration-300 ease-in-out
            ${sidebarOpen && !isDesktop ? 'ml-64' : 'ml-0'}
            md:ml-64
          `}
        >
          {children}
        </main>
      </div>
    </>
  );
}
