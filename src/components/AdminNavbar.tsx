import { Menu, X } from 'lucide-react';

type AdminNavbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isDesktop: boolean;
};

export function AdminNavbar({ isSidebarOpen, onToggleSidebar, isDesktop }: AdminNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center gap-3 border-b bg-white px-4 py-3 md:relative md:border-b-0">
      {!isDesktop && (
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xl font-semibold text-gray-800">FestEats</span>
        <span className="text-sm text-gray-500">Admin Panel</span>
      </div>
    </header>
  );
}
