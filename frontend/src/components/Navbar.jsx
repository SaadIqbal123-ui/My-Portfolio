import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0_40px_40px_-15px_rgba(73,75,214,0.06)] transition-colors duration-300">
      <div className="flex justify-between items-center px-8 py-6 max-w-full mx-auto">
        <NavLink to="/" className="text-2xl font-bold tracking-tighter text-on-surface font-headline">
          MSI
        </NavLink>

        <div className="hidden md:flex items-center gap-12 font-headline tracking-tight">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              style={({ isActive }) => ({})}
              className={({ isActive }) =>
                isActive
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-on-surface hover:text-primary transition-colors'
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <NavLink
            to="/login"
            className="text-on-surface hover:opacity-80 transition-opacity text-sm font-label uppercase tracking-widest"
          >
            Admin Login
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
