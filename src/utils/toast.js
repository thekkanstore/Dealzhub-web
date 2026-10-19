import { toast } from 'react-toastify';

/**
 * Standardized App Toast Helpers
 */
export const showToast = {
  success: (msg, options = {}) => toast.success(msg, options),
  error: (msg, options = {}) => toast.error(msg, options),
  info: (msg, options = {}) => toast.info(msg, options),
  warning: (msg, options = {}) => toast.warning(msg, options),
};

export { toast };
export default toast;
