import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, History, TrendingUp, Settings } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutGrid, label: 'Home' },
    { path: '/history', icon: History, label: 'Lịch sử' },
  ];

  return (
    <nav className="bottom-navbar floating-nav glass">
      <div className="nav-container">
        {navItems.map((item) => (
          <button 
            key={item.path}
            className={`nav-btn ${isActive(item.path) ? 'active' : ''}`} 
            onClick={() => navigate(item.path)}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
