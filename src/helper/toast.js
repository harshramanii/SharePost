import Toast from 'react-native-toast-message';

/**
 * Show success toast message
 * @param {string} message - Success message to display
 * @param {string} title - Optional title (default: 'Success')
 */
export const showSuccess = (message, title = 'Success') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

/**
 * Show error toast message
 * @param {string} message - Error message to display
 * @param {string} title - Optional title (default: 'Error')
 */
export const showError = (message, title = 'Error') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

/**
 * Show info toast message
 * @param {string} message - Info message to display
 * @param {string} title - Optional title (default: 'Info')
 */
export const showInfo = (message, title = 'Info') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export default {
  showSuccess,
  showError,
  showInfo,
};





