import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dqml065pg/image/upload/v1754330139/yourflorist_swgtsa.jpg" 
                alt="YourFlorist Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-handwriting text-gray-900">YourFlorist</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-florist-600 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-florist-600 transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-florist-600 transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-florist-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-florist-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 relative z-50 pointer-events-auto">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="inline-flex items-center justify-center p-2 leading-none text-gray-600 hover:text-florist-600 transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative inline-flex items-center justify-center p-2 leading-none text-gray-600 hover:text-florist-600 transition-colors">
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-florist-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="inline-flex items-center space-x-2 p-2 leading-none text-gray-600 hover:text-florist-600 transition-colors rounded-full hover:bg-gray-100">
                  <div className="w-8 h-8 bg-florist-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-florist-500 text-white px-4 py-2 rounded-md hover:bg-florist-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-florist-600 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for flowers, bouquets..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-florist-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-florist-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="text-gray-700 hover:text-florist-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-florist-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-florist-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/cart"
                className="text-gray-700 hover:text-florist-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart ({getTotalItems()})
              </Link>
              {user ? (
                <>
                  <div className="flex items-center space-x-3 py-2 border-b border-gray-200">
                    <div className="w-10 h-10 bg-florist-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-florist-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-florist-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-florist-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-florist-500 text-white px-4 py-2 rounded-md hover:bg-florist-600 transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 