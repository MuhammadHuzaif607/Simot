import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const SearchBar = ({toggleSidebar}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPages, setFilteredPages] = useState([]);
  const navigate = useNavigate();
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const toggleSidebar = () => {
  //   setIsSidebarOpen((prev) => !prev); // toggle sidebar open/close
  // };

  const pages = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Stock', path: '/stockpage' },
    { name: 'Add Stock', path: '/addstock' },
    { name: 'User Data', path: '/user' },
    { name: 'Add User', path: '/add-user' },
    { name: 'Customer Data', path: '/customerdata' },
    { name: 'Add Customer', path: '/addcustomer' },
    { name: 'Sales Management', path: '/salesdata' },
    { name: 'Sales Status', path: '/salesstatus' },
    { name: 'Sales History', path: '/saleshistory' },
    { name: 'Add Devices', path: '/adddevices' },
    { name: 'Devices Data', path: '/devicesdata' },
  ];

  // Filter pages based on search query
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const filtered = pages.filter((page) =>
        page.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages([]);
    }
  };

  // Navigate to selected page
  const handlePageClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setFilteredPages([]);
  };

  return (
    <div className='flex gap-4 items-center'>
    <div className="w-full h-12 p-2 flex items-center my-4 justify-end mb-6 rounded-md search-bar ">
      
      <div className="flex items-center bg-transparent px-3 py-2 rounded-md w-full relative">
        <FiSearch className="text-gray-400 mr-3 mt-1 text-lg" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
        />

       
        {filteredPages.length > 0 && (
          <div className="absolute top-full left-0 w-full dark-gray text-white shadow-md rounded-md mt-2 z-10">
             {filteredPages.map((page) => (
              <div
                key={page.name}
                onClick={() => handlePageClick(page.path)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-600"
              >
                {page.name}
              </div>
            ))}
          </div>
        )}
      </div>
    
    </div>
 {/* Hamburger Button for Mobile */}
 
 <button
      onClick={() => {
        console.log('Hamburger button clicked!'); // Debugging button click
        toggleSidebar();
      }}
        className="md:hidden button-color px-4 rounded-md py-4 mb-2"
      >
    
        <GiHamburgerMenu />
        {/* {isSidebarOpen ? "Close" : "GiHamburgerMenu"} Sidebar */}
      </button>
    </div>
  );
};

export default SearchBar;
