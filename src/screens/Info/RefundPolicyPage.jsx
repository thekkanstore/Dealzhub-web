import React from 'react';
import { RotateCcw, Calendar, Phone, MessageCircle, Globe, MapPin, CheckCircle2 } from 'lucide-react';

const RefundPolicyPage = () => {
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
              <RotateCcw className="w-8 h-8 text-[#528E6B]" /> Cancellation & Refund Policy
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed pt-2">
              This Cancellation & Refund Policy explains the rules applicable to subscriptions, services, orders, and payments made through Dealzhub.
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
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Vendor Subscription Plans</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Dealzhub provides subscription plans for vendors/businesses, including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mb-3">
              <div className="bg-[#E5EEE9]/30 border border-[#c9dcd1] rounded-2xl p-4 text-center">
                <span className="text-xs font-bold text-[#254030] uppercase">3 Months Plan</span>
                <div className="text-2xl font-black text-gray-900 mt-1">₹899</div>
              </div>
              <div className="bg-[#E5EEE9]/30 border border-[#c9dcd1] rounded-2xl p-4 text-center">
                <span className="text-xs font-bold text-[#254030] uppercase">12 Months Plan</span>
                <div className="text-2xl font-black text-gray-900 mt-1">₹2,999</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs italic">
              The exact plan, price, features, and subscription period applicable to a vendor will be displayed before payment.
            </p>
          </div>

          {/* Section 2 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Cancellation of Vendor Subscription</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              A vendor may request cancellation of their subscription by contacting Dealzhub through the contact details provided below.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Cancellation will normally stop the service from being renewed for the next billing period, where applicable.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Unless specifically stated otherwise, cancellation does not automatically entitle the vendor to a refund for the unused portion of an already-paid subscription period.
            </p>
          </div>

          {/* Section 3 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Refund Eligibility</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Subscription payments are generally non-refundable once the service has been activated or provided.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              However, Dealzhub may consider a refund in situations such as:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-3">
              <li>Duplicate payment</li>
              <li>Payment made due to a technical error</li>
              <li>Payment successfully deducted but the subscription was not activated</li>
              <li>An incorrect amount was charged due to an error on our side</li>
              <li>Other exceptional circumstances approved by Dealzhub</li>
            </ul>
            <p className="text-gray-600 text-sm leading-relaxed">
              Any refund will be considered based on the specific circumstances of the request.
            </p>
          </div>

          {/* Section 4 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Failed or Unsuccessful Payments</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              If money is deducted from your bank account, card, UPI, or other payment method but the Dealzhub service is not activated, please contact us with the transaction details.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              We will verify the transaction and, where applicable, process the refund or activation.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              The time taken for a refund to appear in your account may depend on the payment gateway, bank, or payment service provider.
            </p>
          </div>

          {/* Section 5 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Duplicate Payments</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              If the same subscription or service is accidentally paid for more than once, please contact Dealzhub.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              After verifying the duplicate transaction, the eligible additional payment may be refunded through the applicable payment method.
            </p>
          </div>

          {/* Section 6 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Customer Orders and Product Refunds</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Dealzhub may connect customers with independent vendors and local businesses.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Product availability, pricing, delivery, cancellation, replacement, and product-level refunds may depend on the individual vendor's policies and the nature of the product or service.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Where Dealzhub is only providing the marketplace/platform service, the vendor may be responsible for fulfilling the customer's product order.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Customers should review the applicable vendor's cancellation, return, replacement, and refund terms before completing a purchase.
            </p>
          </div>

          {/* Section 7 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Non-Refundable Situations</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              A refund may not be provided where:
            </p>
            <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1 mb-2">
              <li>The requested service has already been provided</li>
              <li>The subscription period has already started and the service has been activated</li>
              <li>The customer/vendor simply changes their mind after service activation</li>
              <li>The issue is caused by incorrect information provided by the user</li>
              <li>The payment relates to services already consumed</li>
              <li>The refund request does not meet the applicable eligibility requirements</li>
            </ul>
            <p className="text-gray-500 text-xs italic">
              This does not limit any rights that cannot legally be excluded under applicable law.
            </p>
          </div>

          {/* Section 8 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">8. How to Request a Refund</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              To request a refund, contact Dealzhub with:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Name</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Registered mobile number</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Email address, if applicable</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Transaction/order ID</span>
                </li>
              </ul>
              
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Date of payment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Amount paid</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Reason for requesting the refund</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#528E6B] shrink-0" />
                  <span>Relevant payment details/proof</span>
                </li>
              </ul>
            </div>

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
                  <span>Phone: +91 7907074434</span>
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

          {/* Section 9 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Refund Processing</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              After receiving a refund request, Dealzhub may review the transaction and request additional information where necessary.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              If a refund is approved, it will normally be processed through the original payment method or another appropriate method. The time required for the amount to appear in the user's account may vary depending on the bank, payment gateway, or payment service provider.
            </p>
          </div>

          {/* Section 10 */}
          <div className="py-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">
              Dealzhub may update this Cancellation & Refund Policy when necessary to reflect changes in our services, pricing, payment methods, or applicable laws.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              The updated policy will be published on this page with a revised effective date.
            </p>
          </div>

          {/* Section 11 */}
          <div className="py-6 pb-0">
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              For cancellation, refund, payment, or subscription-related questions, contact:
            </p>
            
            <div className="bg-[#E5EEE9]/30 border border-[#c9dcd1] rounded-2xl p-4 text-sm text-[#254030] space-y-1">
              <div className="font-bold">Dealzhub</div>
              <div>Kerala, India</div>
              <div>Phone / WhatsApp: +91 7907074434</div>
              <div>Website: <a href="https://www.dealzhub.co.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold">https://www.dealzhub.co.in</a></div>
            </div>
            
            <div className="mt-4 bg-[#E5EEE9]/50 border border-[#c9dcd1] rounded-xl px-4 py-2.5 text-center text-xs font-semibold text-[#254030]">
              Dealzhub — Bringing Local Businesses Online.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RefundPolicyPage;
