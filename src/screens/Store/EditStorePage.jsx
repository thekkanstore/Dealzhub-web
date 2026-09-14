import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorDetailsForm from '../../components/vendor/VendorDetailsForm';
import SubscriptionPlanModal from '../../components/vendor/SubscriptionPlanModal';
import { useAppContext } from '../../context/AppContext';
import { getStoreByUserId, updateStore } from '../../services/firestore';
import { uploadImageToStorage } from '../../services/firebaseStorageService';
import { createCashfreeOrder, initiateCashfreeWebCheckout } from '../../services/cashfreeService';
import { ArrowLeft, Sparkles, AlertTriangle, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditStorePage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [initialStoreData, setInitialStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (user) {
        try {
          const currentUserId = user?.uid || user?.providerData?.[0]?.uid;
          const userEmail = user?.email || user?.providerData?.[0]?.email;
          const storeData = await getStoreByUserId(currentUserId, userEmail);
          if (storeData) {
            setStore(storeData);
            setInitialStoreData({
              storeName: storeData.storeName,
              address: storeData.address,
              city: storeData.city,
              state: storeData.state,
              phoneNumber: storeData.phoneNumber,
              email: storeData.email,
              logoUrl: storeData.logoUrl || storeData.logo || '',
              logoBase64: storeData.logoBase64 || '',
            });
          } else {
            navigate('/vendordetails');
          }
        } catch (error) {
          console.error('Error fetching store data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchStoreData();
  }, [user, navigate]);

  const handleSubmit = async (formData) => {
    if (user && initialStoreData) {
      setIsSaving(true);
      try {
        const currentUserId = user?.uid || user?.providerData?.[0]?.uid;
        let finalLogoUrl = formData.logoUrl || initialStoreData.logoUrl || '';
        if (formData.logoFile) {
          const uploadRes = await uploadImageToStorage(
            formData.logoFile,
            `images/stores/${currentUserId}`
          );
          if (uploadRes.success && uploadRes.url) {
            finalLogoUrl = uploadRes.url;
          } else {
            console.error('Failed to upload store logo:', uploadRes.error);
            alert(`Failed to upload store logo: ${uploadRes.error || 'Storage error'}`);
            setIsSaving(false);
            return;
          }
        }

        const updatedStoreData = {
          storeName: formData.storeName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logoUrl: finalLogoUrl,
          logo: finalLogoUrl,
          logoBase64: formData.logoBase64 || initialStoreData.logoBase64 || '',
          updatedAt: new Date(),
        };

        await updateStore(currentUserId, updatedStoreData);
        alert('Store details updated successfully!');
        if (store?.id) {
          navigate(`/vendor/${store.id}`);
        } else {
          navigate('/home');
        }
      } catch (error) {
        console.error('Error updating store:', error);
        alert('Failed to update store. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleLaunchPayment = async (planId = '12_months', amount = 2999) => {
    if (!store || !user) return;

    try {
      setPaymentLoading(true);
      const timestamp = Date.now();
      const { doc, getDoc, setDoc, collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../firebase');

      let targetStoreRef = null;
      const storeDocId = store.id;

      if (storeDocId) {
        const candidateRef = doc(db, 'stores', storeDocId);
        const snap = await getDoc(candidateRef);
        if (snap.exists()) {
          targetStoreRef = candidateRef;
        }
      }

      const currentUserId = user?.uid || user?.providerData?.[0]?.uid;

      if (!targetStoreRef && currentUserId) {
        const q = query(collection(db, 'stores'), where('userId', '==', currentUserId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetStoreRef = snap.docs[0].ref;
        }
      }

      const activeStoreId = targetStoreRef ? targetStoreRef.id : (storeDocId || currentUserId);
      const orderId = `order_${activeStoreId}_${timestamp}`;
      const returnUrl = `${window.location.origin}/payment-status?order_id=${orderId}`;

      if (targetStoreRef) {
        await setDoc(targetStoreRef, {
          paymentStatus: 'pending',
          subscriptionPlan: planId,
          subscriptionAmount: amount,
          paymentOrderId: orderId,
          updatedAt: new Date(),
        }, { merge: true });
      }

      const cashfreeOrder = await createCashfreeOrder({
        orderId,
        orderAmount: amount,
        customerName: store.storeName,
        customerEmail: store.email,
        customerPhone: store.phoneNumber,
        returnUrl,
      });

      if (cashfreeOrder && cashfreeOrder.payment_session_id) {
        await initiateCashfreeWebCheckout(cashfreeOrder.payment_session_id);
      }
    } catch (error) {
      console.error('Payment launch error:', error);
      alert('Failed to launch payment gateway: ' + (error.message || 'Please try again.'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSelectRenewalPlan = (plan) => {
    setIsPlanModalOpen(false);
    handleLaunchPayment(plan.id, plan.price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!initialStoreData || !store) {
    return <div className="flex justify-center items-center h-screen">No store data available to edit.</div>;
  }

  // Subscription calculation logic
  const isPendingStatus = store.vendorStatus?.toLowerCase() === 'pending';
  const isPaymentPending = store.paymentStatus === 'pending' || store.paymentStatus === 'FAILED' || (isPendingStatus && store.paymentStatus !== 'PAID');

  let subscriptionEndDate = null;
  if (store.subscriptionEndDate) {
    subscriptionEndDate = store.subscriptionEndDate.toDate
      ? store.subscriptionEndDate.toDate()
      : new Date(store.subscriptionEndDate);
  }

  const isExpired = subscriptionEndDate ? new Date() > subscriptionEndDate : false;
  const isActive = !isPaymentPending && !isExpired && subscriptionEndDate;

  const formattedEndDate = subscriptionEndDate ? subscriptionEndDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'N/A';

  return (
    <div className="min-h-screen bg-white">
      {paymentLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-900">Redirecting to Cashfree Payment Gateway...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-1.5 mb-4 cursor-pointer text-sm text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit"
        >
          <ArrowLeft />
        </button>

        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Edit Store</h2>

          {/* Pending Payment Card */}
          {isPaymentPending && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-amber-900 space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Payment Required</h4>
                  <p className="text-xs text-amber-800">
                    Your shop registration payment is pending. Complete payment to activate your store.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (store.subscriptionPlan) {
                    handleLaunchPayment(store.subscriptionPlan, store.subscriptionAmount || 2999);
                  } else {
                    setIsPlanModalOpen(true);
                  }
                }}
                className="w-full py-3 px-6 bg-primaryButtonBackgroundColor text-white font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Complete Payment {store.subscriptionAmount ? `(₹${store.subscriptionAmount})` : ''}
              </button>
            </div>
          )}

          {/* Expired Subscription Card */}
          {isExpired && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900 space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Subscription Expired</h4>
                  <p className="text-xs text-red-800">
                    Your plan expired on {formattedEndDate}. Your products are hidden from public feed.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="w-full py-3 px-6 bg-primaryButtonBackgroundColor text-white font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Renew / Upgrade Subscription
              </button>
            </div>
          )}

          {/* Active Subscription Card */}
          {isActive && (
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-2xl p-5 border border-emerald-500/40 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Active Subscription</span>
                </div>
                <span className="bg-emerald-700 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {store.subscriptionPlan === '3_months' ? '3 Months' : '12 Months'}
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-50">
                Valid until: <span className="text-amber-300 font-bold">{formattedEndDate}</span>
              </p>
              <p className="text-[11px] text-emerald-200/80">
                You can renew or switch plans once your active subscription expires.
              </p>
            </div>
          )}

          <VendorDetailsForm
            initialData={initialStoreData}
            onSubmit={handleSubmit}
            submitButtonText={isSaving ? "Updating Store..." : "Update Store"}
          />
        </div>
      </div>

      <SubscriptionPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSelectPlan={handleSelectRenewalPlan}
        initialPlanId={store.subscriptionPlan || '12_months'}
      />
    </div>
  );
};

export default EditStorePage;
