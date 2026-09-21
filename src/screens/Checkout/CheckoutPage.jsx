import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadCashfreeSDK } from '../../services/cashfreeService';
import { Loader2, AlertCircle } from 'lucide-react';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id') || searchParams.get('payment_session_id');
  const envParam = (searchParams.get('env') || 'production').toLowerCase();

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage('No payment session ID provided. Please return to the app and try again.');
      return;
    }

    let isMounted = true;

    const initiatePayment = async () => {
      try {
        const CashfreeSDK = await loadCashfreeSDK();
        const mode = envParam === 'sandbox' ? 'sandbox' : 'production';
        const cashfree = CashfreeSDK({ mode });

        cashfree.checkout({
          paymentSessionId: sessionId,
          redirectTarget: '_self',
        });
      } catch (err) {
        console.error('Checkout error:', err);
        if (isMounted) {
          // Fallback to POST form submit
          try {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = envParam === 'sandbox' 
              ? 'https://sandbox.cashfree.com/pg/view/sessions/checkout' 
              : 'https://api.cashfree.com/pg/view/sessions/checkout';
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'payment_session_id';
            input.value = sessionId;
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
          } catch (postErr) {
            setErrorMessage(err.message || 'Failed to initialize payment gateway.');
          }
        }
      }
    };

    const timer = setTimeout(() => {
      initiatePayment();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sessionId, envParam]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
        <div>
          <h1 className="text-2xl font-black text-emerald-900 tracking-tight">DealzHub</h1>
          <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wider">
            Cashfree Payment Gateway
          </span>
        </div>

        {!errorMessage ? (
          <div className="space-y-4 py-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                Connecting to Cashfree...
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Please wait while we redirect you to the secure payment checkout. Do not close or refresh.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">Payment Notice</h3>
              <p className="text-xs text-red-600 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="w-full py-2.5 px-4 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-800 transition"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
