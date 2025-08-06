import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

// TikTok icon component (since lucide-react doesn't have TikTok)
const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.321 5.562a5.123 5.123 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.938-1.263-2.061-1.263-3.426h-3.423v13.938c0 2.034-1.649 3.685-3.685 3.685s-3.685-1.651-3.685-3.685c0-2.034 1.649-3.685 3.685-3.685.203 0 .401.017.593.049V7.84c-.192-.026-.389-.04-.593-.04C4.636 7.8 1 11.436 1 15.85s3.636 8.05 8.05 8.05 8.05-3.636 8.05-8.05V9.477c1.515 1.085 3.36 1.72 5.369 1.72v-3.423c-1.207 0-2.304-.39-3.148-1.212z"/>
  </svg>
);

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
              <a 
                href="https://www.facebook.com/profile.php?id=61576720934388#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-florist-600 transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://www.tiktok.com/@your.florist74?_t=ZS-8yeeFGNXcor&_r=1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-florist-600 transition-colors"
                aria-label="Visit our TikTok page"
              >
                <TikTokIcon />
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
                  Lô E2a-7, Đường D1<br />
                  Khu Công nghệ cao<br />
                  Phường Tăng Nhơn Phú, TPHCM
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-florist-500" />
                <span className="text-gray-600 text-sm">(84) 912 051 433</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-florist-500" />
                <span className="text-gray-600 text-sm">dungpltse184549@fpt.edu.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2025 YourFlorist. All rights reserved.
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