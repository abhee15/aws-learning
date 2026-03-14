import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';

export function RootLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center gap-4 px-4 lg:px-6 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-700 w-56">
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  className="bg-transparent text-sm text-gray-300 placeholder-gray-500 outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <span className="text-aws-orange text-xs font-semibold">SA Pro</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[calc(100vh-56px)]"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
