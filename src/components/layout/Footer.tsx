import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dqml065pg/image/upload/v1754330139/yourflorist_swgtsa.jpg" 
                  alt="YourFlorist Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-semibold text-gray-900">YourFlorist</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Bringing beauty and joy to your special moments with our carefully curated selection of fresh flowers and stunning arrangements.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-florist-600 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-florist-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-florist-600 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-florist-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-florist-600 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-florist-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-florist-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-florist-600 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-florist-500" />
                <span className="text-gray-600 text-sm">
                  123 Flower Street<br />
                  Garden City, GC 12345
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-florist-500" />
                <span className="text-gray-600 text-sm">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-florist-500" />
                <span className="text-gray-600 text-sm">hello@yourflorist.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2024 YourFlorist. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-600 hover:text-florist-600 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-florist-600 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/shipping" className="text-gray-600 hover:text-florist-600 transition-colors text-sm">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 