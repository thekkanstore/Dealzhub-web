import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyCashfreeOrder } from '../../services/cashfreeService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png';

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
  const [message, setMessage] = useState('Verifying your payment status with Cashfree...');
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    const checkPayment = async () => {
      if (!orderId) {
        setStatus('failed');
        setMessage('Invalid request. Payment order ID missing.');
        return;
      }

      try {
        const orderDetails = await verifyCashfreeOrder(orderId);

        if (orderDetails.order_status === 'PAID') {
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const parts = orderId.split('_');
          let sId = parts.length >= 3 ? parts[1] : null;
          let targetStoreRef = null;

          if (sId) {
            const candidateRef = doc(db, 'stores', sId);
            const candidateSnap = await getDoc(candidateRef);
            if (candidateSnap.exists()) {
              targetStoreRef = candidateRef;
            }
          }

          if (!targetStoreRef) {
            const q = query(collection(db, 'stores'), where('paymentOrderId', '==', orderId));
            const snap = await getDocs(q);
            if (!snap.empty) {
              targetStoreRef = snap.docs[0].ref;
              sId = snap.docs[0].id;
            }
          }

          if (targetStoreRef) {
            setStoreId(sId);
            const storeSnap = await getDoc(targetStoreRef);
            const storeData = storeSnap.exists() ? storeSnap.data() : {};

            const plan = storeData.subscriptionPlan || '12_months';
            const days = plan === '3_months' ? 90 : 365;
            const startDate = new Date();
            const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

            await setDoc(targetStoreRef, {
              paymentStatus: 'PAID',
              vendorStatus: 'approved',
              subscriptionStartDate: startDate,
              subscriptionEndDate: endDate,
              updatedAt: new Date(),
            }, { merge: true });
          }

          setStatus('success');
          setMessage('Payment successful! Your store subscription is active and approved.');
        } else {
          setStatus('failed');
          setMessage(`Payment status: ${orderDetails.order_status || 'FAILED'}. Please try again.`);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Error verifying payment: ' + (error.message || 'Please contact support.'));
      }
    };

    checkPayment();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 p-2 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
          <img src={appLogo} alt="DealzHub Logo" className="w-full h-full object-contain" />
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Verifying Payment</h2>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600 text-sm">{message}</p>
            <button
              onClick={() => navigate(storeId ? `/vendor/${storeId}` : '/home')}
              className="w-full mt-4 bg-primaryButtonBackgroundColor text-white font-semibold py-3.5 px-6 rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Go to My Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Unsuccessful</h2>
            <p className="text-gray-600 text-sm">{message}</p>
            <button
              onClick={() => navigate('/home')}
              className="w-full mt-4 bg-gray-900 text-white font-semibold py-3.5 px-6 rounded-full shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
