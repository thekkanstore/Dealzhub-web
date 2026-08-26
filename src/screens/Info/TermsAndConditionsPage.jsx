import React from 'react';
import { FileText, Calendar, Phone, MessageCircle, Globe, MapPin, CheckCircle2 } from 'lucide-react';

const TermsAndConditionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="bg-white rounded-t-3xl p-8 md:p-12 border-x border-t border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5EEE9] opacity-40 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10 space-y-4">
            <span className="bg-[#E5EEE9] text-[#254030] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Last Updated: 26 August 2026
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#528E6B]" /> Terms & Conditions
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed pt-2">
              Welcome to DealzHub. Please read these Terms and Conditions carefully before using our website, mobile application, or any of our digital commerce services.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Website: <a href="https://www.dealzhub.co.in" target="_blank" rel="noopener noreferrer" className="text-[#528E6B] font-semibold hover:underline">https://www.dealzhub.co.in</a>
            </p>
          </div>
        </div>

        {/* Content Block */}
        <div className="bg-white rounded-b-3xl p-8 md:p-12 border-x border-b border-gray-100 shadow-sm divide-y divide-gray-100">
          
          {/* Section 1 */}
          <div className="py-6 first:pt-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              By accessing, browsing, registering on, or using DealzHub ("Platform", "we", "us", or "our"), you agree to comply with and be bound by these Terms and Conditions and our associated Privacy Policy and Cancellation & Refund Policy. If you do not agree to these terms, please do not use the Platform.
            </p>
          </div>

          {/* Section 2 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Description of Services</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              DealzHub provides an online marketplace and digital commerce platform that connects independent local merchants ("Vendors" or "Sellers") with potential buyers ("Customers"). DealzHub allows Vendors to register, subscribe, set up online stores, list products, and showcase deals to local customers.
            </p>
          </div>

          {/* Section 3 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Account Eligibility and Registration</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              To use certain features of the Platform (such as selling or making enquiries), you must register for an account. By registering, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>All information provided during registration is accurate, current, and complete.</li>
              <li>You will maintain the security and confidentiality of your account credentials.</li>
              <li>You are legally capable of entering into binding contracts under applicable law.</li>
              <li>You will immediately notify us of any unauthorized use of your account.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Vendor Policies and Conduct</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              As a Vendor on DealzHub, you are required to comply with our code of conduct:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
              <li className="leading-relaxed">
                <strong>Professional Behavior:</strong> You must maintain respectful and professional behavior with all customers and platform users at all times.
              </li>
              <li className="leading-relaxed">
                <strong>Accuracy of Listings:</strong> You must list products with accurate descriptions, pricing, and availability. You are required to update product stock regularly to avoid ordering issues.
              </li>
              <li className="leading-relaxed">
                <strong>Product Quality & Support:</strong> Vendors must ensure product quality and handle customer complaints, returns, or replacement requests promptly.
              </li>
              <li className="leading-relaxed">
                <strong>Refunds & Replacements:</strong> Damaged, defective, or incorrect items must be replaced or refunded in accordance with your store policies and applicable customer laws.
              </li>
              <li className="leading-relaxed">
                <strong>Account Inactivity:</strong> Inactive vendor accounts may be cancelled by the platform administration after a prolonged period of inactivity.
              </li>
              <li className="leading-relaxed">
                <strong>Suspension and Termination:</strong> Repeated, unresolved, or verified complaints from customers may lead to immediate account suspension or a permanent ban from the Platform.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Prohibited and Restricted Activities</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Users and Vendors agree not to engage in any prohibited activities on DealzHub. Specifically:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-2">
              <li className="leading-relaxed text-[#fc4a1a] font-medium">
                Selling, advertising, or promoting illegal, restricted, regulated, or counterfeit items is strictly prohibited.
              </li>
              <li className="leading-relaxed text-[#fc4a1a] font-medium">
                Any form of scam, fraud, misrepresentation, or illegal activity on DealzHub will result in immediate termination of access and will be reported to law enforcement for legal action.
              </li>
              <li className="leading-relaxed">
                You may not post content that is defamatory, offensive, violent, harmful, or infringes on third-party intellectual property rights.
              </li>
              <li className="leading-relaxed">
                You may not bypass or attempt to bypass any security features or subscription plans of the Platform.
              </li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Subscription and Payments</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Vendors agree to pay any applicable subscription fees displayed on the Platform.
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>Subscription charges are subject to change, with prior notice given to active subscribers.</li>
              <li>Payments are processed securely via our integration with third-party payment providers (e.g. PhonePe).</li>
              <li>For subscription cancellations, duplicate payments, or refund requests, please consult our Cancellation & Refund Policy.</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Disclaimers and Limitation of Liability</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              DealzHub is an online marketplace provider. We connect customers with independent local merchants, but we do not directly manufacture, store, inspect, or deliver the products sold by third-party Vendors.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              To the fullest extent permitted by applicable law, DealzHub shall not be liable for any direct, indirect, incidental, or consequential damages resulting from transactions, product listings, vendor behavior, or the inability to use the Platform.
            </p>
          </div>

          {/* Section 8 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms and Conditions at any time. When changes are made, the "Last Updated" date at the top will be updated. Your continued use of the Platform after changes are posted constitutes acceptance of the new terms.
            </p>
          </div>

          {/* Section 9 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              If you have any questions or complaints regarding these Terms & Conditions, please contact us:
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">DEALZHUB</h3>
                <div className="flex items-start gap-2 text-gray-600 text-xs mt-2">
                  <MapPin className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
                  <span>Location: Kerala, India</span>
                </div>
              </div>
              <div className="space-y-2.5">
                <a href="tel:+917907074434" className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#528E6B] transition-colors">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>Phone / WhatsApp: +91 7907074434</span>
                </a>
                <a href="https://wa.me/917907074434" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#128c7e] transition-colors">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span>WhatsApp Chat</span>
                </a>
                <a href="https://www.dealzhub.co.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#528E6B] transition-colors">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>www.dealzhub.co.in</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section 10 */}
          <div className="py-6 pb-0">
            <h2 className="text-lg font-bold text-gray-900 mb-2">10. Acknowledgment</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              By using our platform or subscribing to our services, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
            </p>
            <div className="bg-[#E5EEE9]/50 border border-[#c9dcd1] rounded-xl px-4 py-2.5 text-center text-xs font-semibold text-[#254030]">
              DealzHub — Bringing Local Businesses Online.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
