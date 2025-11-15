import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { userProfile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const initials = userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
    : userProfile?.email?.[0].toUpperCase() ?? 'U';

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="flex items-center">
         {/* Hamburger Menu for Mobile */}
        <button 
          className="text-gray-500 focus:outline-none md:hidden"
          onClick={onMenuClick}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Search bar could go here */}
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          className="flex items-center space-x-2 focus:outline-none"
        >
           <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-gray-700">{userProfile?.firstName} {userProfile?.lastName}</div>
            <div className="text-xs text-gray-500">{userProfile?.role}</div>
          </div>
        </button>
        
        {dropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-20"
            onMouseLeave={() => setDropdownOpen(false)}
            >
            <a href="#/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</a>
            <button 
              onClick={logout} 
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;