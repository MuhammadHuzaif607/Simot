import { useState } from 'react';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // Toggle state (open/close)
  };
  return (
    <div className="flex min-h-screen main-bg">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col px-4 overflow-auto">
        {/* <SearchBar toggleSidebar={toggleSidebar} /> */}
        {children}
      </div>
    </div>
  );
}

export default Layout;
