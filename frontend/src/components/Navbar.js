import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Camera, Edit3, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/detector', label: 'Food Detector', icon: Camera },
    { path: '/manual', label: 'Manual Entry', icon: Edit3 },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="navbar glass-effect"
    >
      <div className="navbar-container">
        <div className="navbar-content">
          <motion.div 
            className="navbar-logo"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="logo-link">
              <div className="logo-icon">
                <span>N</span>
              </div>
              <span className="logo-text">
                NutriScope
              </span>
            </Link>
          </motion.div>

          <div className="nav-desktop">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="nav-mobile-toggle">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="mobile-menu-btn"
            >
              <Menu size={24} />
            </motion.button>
          </div>
        </div>

        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nav-mobile"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`nav-mobile-link ${isActive ? 'nav-mobile-link-active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;