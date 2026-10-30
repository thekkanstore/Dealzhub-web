const isSandbox = (import.meta.env.VITE_CASHFREE_ENV || 'production').toLowerCase() === 'sandbox';

const CASHFREE_SERVICE_URL =
  import.meta.env.VITE_CASHFREE_SERVICE_URL || 'https://createcashfreeorder-298300377700.us-central1.run.app';

const CASHFREE_CONFIG = {
  APP_ID: import.meta.env.VITE_CASHFREE_APP_ID || '',
  ENV: isSandbox ? 'sandbox' : 'production',
  SERVICE_URL: CASHFREE_SERVICE_URL,
};

/**
 * Dynamically load Cashfree JS SDK for Web Checkout
 */
export const loadCashfreeSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK loaded but window.Cashfree is undefined'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.body.appendChild(script);
  });
};

/**
 * Create a Cashfree Payment Order via Serverless Proxy (CRIT-02 Resolved)
 * Secret keys are protected server-side in Google Secret Manager / Cloud Run.
 */
export const createCashfreeOrder = async ({
  orderId,
  orderAmount,
  customerName,
  customerEmail,
  customerPhone,
  returnUrl,
}) => {
  try {
    const cleanPhone = (customerPhone || '9999999999').toString().replace(/[^0-9]/g, '').slice(-10);
    const cleanEmail = customerEmail && customerEmail.includes('@') ? customerEmail : 'vendor@dealzhub.co.in';

    const payload = {
      orderId: String(orderId),
      orderAmount: parseFloat(orderAmount),
      customerName: customerName || 'Dealzhub Vendor',
      customerEmail: cleanEmail,
      customerPhone: cleanPhone.length === 10 ? cleanPhone : '9999999999',
      returnUrl: returnUrl || `${window.location.origin}/payment-status?order_id={order_id}`,
    };

    const response = await fetch(`${CASHFREE_CONFIG.SERVICE_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree order creation failed:', data);
      throw new Error(data.message || 'Failed to create payment order with Cashfree');
    }

    return data;
  } catch (error) {
    console.error('Error in createCashfreeOrder:', error);
    throw error;
  }
};

/**
 * Verify Order Status from Cashfree via Serverless Proxy (CRIT-02 Resolved)
 */
export const verifyCashfreeOrder = async (orderId) => {
  try {
    const response = await fetch(
      `${CASHFREE_CONFIG.SERVICE_URL}/verify-order?orderId=${encodeURIComponent(orderId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree order verification failed:', data);
      throw new Error(data.message || 'Failed to verify payment order with Cashfree');
    }

    return data;
  } catch (error) {
    console.error('Error in verifyCashfreeOrder:', error);
    throw error;
  }
};

/**
 * Launch Cashfree Web Checkout
 */
export const initiateCashfreeWebCheckout = async (paymentSessionId) => {
  try {
    const CashfreeSDK = await loadCashfreeSDK();
    const cashfree = CashfreeSDK({ mode: CASHFREE_CONFIG.ENV });

    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: '_self',
    });
  } catch (error) {
    console.error('Error initiating Cashfree checkout:', error);
    throw error;
  }
};
