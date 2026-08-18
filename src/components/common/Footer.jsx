import React from 'react';
import { MapPin, User, Mail, Phone, Info } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png';

const Footer = () => {
  return (
    <footer className="bg-[#1b3024] text-white border-t border-[#254030] pt-12 pb-6 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand Section */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={appLogo}
              alt="DealzHub Logo"
              className="w-12 h-12 object-cover rounded-xl bg-white p-1"
            />
            <span className="text-2xl font-bold tracking-tight text-white">
              DealzHub
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            Your premium marketplace for local deals, products, and services. Buy, sell, and discover the best deals around you.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-[#82C39B] flex items-center gap-2">
            <Info className="w-5 h-5" /> Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="/home" className="hover:text-white transition-colors duration-200">
                Home
              </a>
            </li>
            <li>
              <a href="/favorites" className="hover:text-white transition-colors duration-200">
                Favorites
              </a>
            </li>
            <li>
              <a href="/cart" className="hover:text-white transition-colors duration-200">
                Cart
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info Section */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-[#82C39B] flex items-center gap-2">
            <User className="w-5 h-5" /> Contact Details
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">Anoj C Anil</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#82C39B] shrink-0 mt-0.5" />
              <span>
                Sabdhi parambuvila, Kodangavila,<br />
                Neyyattinkara, Trivandrum
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-[#254030] text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} DealzHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
