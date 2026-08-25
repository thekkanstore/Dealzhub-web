import React from 'react';
import { Info, HelpCircle, Eye, Target, Sparkles, Phone, MessageCircle, Globe, CheckCircle2, Building2 } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1b3024] to-[#254030] text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#528E6B] opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 space-y-4">
            <span className="bg-[#528E6B]/30 text-[#82C39B] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> About Us
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Welcome to Dealzhub
            </h1>
            <p className="text-gray-200 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              Dealzhub is a Kerala-based online marketplace and digital commerce platform created to help local shops and businesses take their business online and connect with more customers.
            </p>
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-white">Our Goal:</span> Make local shopping easier for customers and online business easier for local shop owners.
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="bg-[#E5EEE9] text-[#254030] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                We believe every local shop should have the opportunity to grow in the digital world.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Our vision is to connect local businesses with local customers and create a simple, affordable and convenient digital shopping ecosystem across Kerala.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="bg-[#E5EEE9] text-[#254030] w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Our mission is to help small and local businesses:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'Build an online presence',
                  'Reach more customers',
                  'Promote their products digitally',
                  'Make their stores easier to discover',
                  'Grow their business using simple digital tools',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 text-sm leading-relaxed mt-4">
                At the same time, we aim to help customers discover products and businesses available around them.
              </p>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#E5EEE9] text-[#254030] w-12 h-12 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">What We Do</h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            Dealzhub helps local businesses build their online presence through their own digital store. Vendors can showcase their products, share their store with customers, and reach people through online channels.
          </p>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Our services include:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Online Store for local businesses',
                'Dedicated Store Link',
                'QR Code for easy store sharing',
                'Product Listing Support',
                'Product and Stock Updates',
                'Hosting & Server Support',
                'Customer Enquiry and Order Support',
                'Social Media Sharing',
                'Dealzhub Marketing Support',
                'Online Shop QR Stickers',
              ].map((service, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-[#528E6B]/30 hover:bg-[#E5EEE9]/20 transition-all duration-200">
                  <div className="w-2 h-2 rounded-full bg-[#528E6B]"></div>
                  <span className="text-gray-700 text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Dealzhub & Commitment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Why Dealzhub? */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#E5EEE9] text-[#254030] w-10 h-10 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 font-sans">Why Dealzhub?</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Many local businesses have great products but do not have the time, resources or technical knowledge to build and manage an online presence.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mt-3">
              Dealzhub makes this process simpler by providing the essential tools and support needed to take a local business online.
            </p>
          </div>

          {/* Our Commitment */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#E5EEE9] text-[#254030] w-10 h-10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 font-sans">Our Commitment</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              We are committed to providing a simple and user-friendly platform while continuously improving our services based on the needs of local businesses and customers.
            </p>
            <div className="mt-4 bg-[#E5EEE9]/50 border border-[#c9dcd1] rounded-xl px-4 py-2 text-center text-xs font-semibold text-[#254030]">
              Dealzhub — Bringing Local Businesses Online.
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-[#E5EEE9] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#528E6B]/5 rounded-full blur-2xl"></div>
          
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="text-gray-500 text-sm mt-1">Get in touch with Dealzhub team</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Dealzhub</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Kerala, India
                </p>
              </div>
              
              <div className="space-y-3">
                <a
                  href="tel:+917907074434"
                  className="flex items-center gap-3 text-[#121212] hover:text-[#528E6B] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#E5EEE9]/50 group-hover:border-[#528E6B]/30 transition-all">
                    <Phone className="w-5 h-5 text-gray-600 group-hover:text-[#528E6B]" />
                  </div>
                  <span className="text-sm font-medium">+91 7907074434</span>
                </a>

                <a
                  href="https://wa.me/917907074434"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#121212] hover:text-[#128c7e] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#e8f5e9] group-hover:border-[#128c7e]/30 transition-all">
                    <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-[#128c7e]" />
                  </div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>

                <a
                  href="https://www.dealzhub.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#121212] hover:text-[#528E6B] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-[#E5EEE9]/50 group-hover:border-[#528E6B]/30 transition-all">
                    <Globe className="w-5 h-5 text-gray-600 group-hover:text-[#528E6B]" />
                  </div>
                  <span className="text-sm font-medium">www.dealzhub.co.in</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUsPage;
