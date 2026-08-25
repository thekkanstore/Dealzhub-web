import React from 'react';
import { Shield, Calendar, Phone, MessageCircle, Globe, MapPin } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="bg-white rounded-t-3xl p-8 md:p-12 border-x border-t border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5EEE9] opacity-40 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10 space-y-4">
            <span className="bg-[#E5EEE9] text-[#254030] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Effective Date: 25 August 2026
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#528E6B]" /> Privacy Policy
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed pt-2">
              Welcome to Dealzhub. Dealzhub ("Dealzhub", "we", "us", or "our") operates an online marketplace and digital commerce platform through our website and mobile application.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Website: <a href="https://www.dealzhub.co.in" target="_blank" rel="noopener noreferrer" className="text-[#528E6B] font-semibold hover:underline">https://www.dealzhub.co.in</a>
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              This Privacy Policy explains how we collect, use, store, protect and process information when you use the Dealzhub website, mobile application, online stores, and related services. By using Dealzhub, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>

        {/* Content Block */}
        <div className="bg-white rounded-b-3xl p-8 md:p-12 border-x border-b border-gray-100 shadow-sm divide-y divide-gray-100">
          
          {/* Section 1 */}
          <div className="py-6 first:pt-0">
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Depending on how you use Dealzhub, we may collect the following information:
            </p>
            
            <div className="space-y-4 pl-2">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">A. Personal Information</h3>
                <p className="text-gray-600 text-sm mb-1">This may include:</p>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>Name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Delivery or business address</li>
                  <li>Account/login information</li>
                  <li>Information provided when contacting us</li>
                  <li>Other information that you voluntarily provide</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">B. Vendor Information</h3>
                <p className="text-gray-600 text-sm mb-1">If you register as a vendor or business, we may collect:</p>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>Business/store name</li>
                  <li>Owner or contact person's name</li>
                  <li>Mobile number</li>
                  <li>Email address</li>
                  <li>Business address</li>
                  <li>Business-related information</li>
                  <li>Product information</li>
                  <li>Store images, logos and descriptions</li>
                  <li>Payment/subscription information</li>
                  <li>Tax or business information where required</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">C. Order and Transaction Information</h3>
                <p className="text-gray-600 text-sm mb-1">When you place an order, enquiry, or other transaction through Dealzhub, we may process information necessary to complete or support that transaction, such as:</p>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>Order details</li>
                  <li>Products selected</li>
                  <li>Customer contact details</li>
                  <li>Delivery details</li>
                  <li>Payment/transaction status</li>
                  <li>Vendor information</li>
                  <li>Customer enquiries and communications</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">D. Device and Technical Information</h3>
                <p className="text-gray-600 text-sm mb-1">When you use our website or app, certain technical information may be collected automatically, such as:</p>
                <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                  <li>IP address</li>
                  <li>Device type</li>
                  <li>Operating system</li>
                  <li>Browser/app information</li>
                  <li>App version</li>
                  <li>Date and time of access</li>
                  <li>Basic usage information</li>
                  <li>Error and diagnostic information</li>
                </ul>
                <p className="text-gray-500 text-xs mt-2 italic">We use this information mainly to operate, secure and improve our services.</p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We may use personal information for purposes including:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>Creating and managing user accounts</li>
              <li>Providing Dealzhub services</li>
              <li>Connecting customers with vendors</li>
              <li>Processing and supporting orders or enquiries</li>
              <li>Communicating with customers and vendors</li>
              <li>Providing customer support</li>
              <li>Managing vendor subscriptions</li>
              <li>Improving our website and application</li>
              <li>Maintaining security and preventing misuse</li>
              <li>Detecting fraud or suspicious activity</li>
              <li>Sending important service-related notifications</li>
              <li>Providing marketing communications where permitted</li>
              <li>Complying with applicable laws and legal requirements</li>
            </ul>
            <p className="text-gray-500 text-xs mt-3 italic">We aim to collect and use information only for appropriate and necessary purposes.</p>
          </div>

          {/* Section 3 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Information Sharing</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Dealzhub does not sell your personal information as a business practice.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We may share information when necessary to provide our services, including with:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
              <li>Vendors, where information is necessary to fulfil an order or respond to an enquiry</li>
              <li>Delivery or logistics partners, where applicable</li>
              <li>Payment service providers, where applicable</li>
              <li>Hosting, cloud and technology service providers</li>
              <li>Customer-support service providers</li>
              <li>Analytics or security service providers</li>
              <li>Government authorities or law-enforcement agencies when legally required</li>
              <li>Professional advisers where reasonably necessary</li>
            </ul>
            <p className="text-gray-500 text-xs mt-3 italic">We expect service providers handling information on our behalf to use it only for appropriate purposes and to maintain reasonable security.</p>
          </div>

          {/* Section 4 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Vendor and Customer Information</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Dealzhub is designed to connect local businesses and customers.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              When a customer contacts or places an order with a vendor, certain information may be shared with that vendor when reasonably necessary to respond to the enquiry, process the order, or provide the requested service.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Vendors are responsible for handling customer information appropriately and only for legitimate business purposes.
            </p>
          </div>

          {/* Section 5 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Payments</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Where payments are processed through third-party payment providers, payment information may be handled by those providers according to their own privacy policies and terms.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Dealzhub may receive transaction-related information such as payment status, transaction reference, amount, or other information necessary to confirm a transaction.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              We do not intend to store complete card numbers, CVV numbers, UPI PINs, passwords, or similar highly sensitive payment credentials unless specifically required by a lawful and secure payment-processing system.
            </p>
          </div>

          {/* Section 6 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cookies and Similar Technologies</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Our website or services may use cookies or similar technologies to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-2">
              <li>Keep the website functioning properly</li>
              <li>Remember preferences</li>
              <li>Understand website usage</li>
              <li>Improve performance</li>
              <li>Maintain security</li>
              <li>Measure and improve our services</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed">
              You may be able to control cookies through your browser settings. Disabling certain cookies may affect some website functionality.
            </p>
          </div>

          {/* Section 7 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Communications</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              We may contact you through:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-2">
              <li>Phone</li>
              <li>WhatsApp</li>
              <li>SMS</li>
              <li>Email</li>
              <li>In-app notifications</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              These communications may relate to accounts, orders, enquiries, subscriptions, security, service updates, or other Dealzhub services.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Where marketing communications require consent under applicable law, we will seek and manage that consent appropriately.
            </p>
          </div>

          {/* Section 8 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Data Security</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              We take reasonable technical and organisational measures to protect personal information against:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-3">
              <li>Unauthorised access</li>
              <li>Loss</li>
              <li>Misuse</li>
              <li>Alteration</li>
              <li>Unauthorised disclosure</li>
              <li>Destruction</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              However, no internet-based service can guarantee absolute security.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Users should also protect their account credentials and should not share passwords, OTPs, UPI PINs, or other confidential information with anyone.
            </p>
          </div>

          {/* Section 9 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Data Retention</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including providing services, maintaining business records, resolving disputes, preventing fraud, maintaining security, and complying with legal obligations.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              When information is no longer required, we may delete, anonymise, or securely dispose of it, subject to applicable legal requirements.
            </p>
          </div>

          {/* Section 10 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Your Rights</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Subject to applicable law, you may have rights relating to your personal information, including rights to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-3">
              <li>Request information about processing of your personal data</li>
              <li>Request correction or updating of inaccurate information</li>
              <li>Request deletion of personal information where applicable</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Raise a grievance regarding processing of your personal information</li>
              <li>Exercise other rights available under applicable data-protection laws</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Requests may be made using the contact details provided below.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Where identity verification is reasonably necessary, we may request information to verify the request.
            </p>
          </div>

          {/* Section 11 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Withdrawal of Consent</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Where your personal information is processed based on your consent, you may withdraw that consent, subject to applicable law.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Withdrawal of consent may affect our ability to provide certain services or features that require the relevant information.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Withdrawal does not affect processing that was lawfully carried out before the withdrawal.
            </p>
          </div>

          {/* Section 12 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Children's Privacy</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Dealzhub is not intended to knowingly collect personal information from children in violation of applicable law.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              If you are a parent or lawful guardian and believe that a child has provided personal information to us in circumstances where such collection is not permitted, please contact us so that we can take appropriate action.
            </p>
          </div>

          {/* Section 13 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">13. Third-Party Services and Links</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Dealzhub may contain links to third-party websites, applications, payment services, social-media platforms, or other services.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              We are not responsible for the privacy practices or content of third-party services.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Users should review the privacy policies of third-party services before providing information to them.
            </p>
          </div>

          {/* Section 14 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">14. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              When we make changes, we may update the "Effective Date" at the top of this policy.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              We encourage users to review this page periodically.
            </p>
          </div>

          {/* Section 15 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">15. Contact Us</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              If you have questions, requests, complaints, or concerns regarding this Privacy Policy or the handling of your personal information, please contact us:
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
            <p className="text-gray-500 text-xs mt-3 italic">We will make reasonable efforts to respond to privacy-related requests within the period required by applicable law.</p>
          </div>

          {/* Section 16 */}
          <div className="py-6 pb-0">
            <h2 className="text-lg font-bold text-gray-900 mb-2">16. Consent and Acknowledgement</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              By using Dealzhub and providing personal information where required, you acknowledge that you have read this Privacy Policy and understand how your information may be processed as described above, subject to applicable law.
            </p>
            <div className="bg-[#E5EEE9]/50 border border-[#c9dcd1] rounded-xl px-4 py-2.5 text-center text-xs font-semibold text-[#254030]">
              Dealzhub — Bringing Local Businesses Online.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
