import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatWidget from '../chat/ChatWidget';
import { useAuth } from '../../context/AuthContext';
import PageTransition from './PageTransition';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div style={{ height: '100vh', background: 'var(--color-background-tertiary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar onMenuClick={() => setIsSidebarOpen(s => !s)} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content — offset by sidebar width on large screens */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            width: '100%',
            padding: '28px 28px 40px',
          }}
          className="lg:ml-[220px]"
        >
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {user?.role === 'student' && <ChatWidget />}
    </div>
  );
};

export default Layout;
