export const haptics = {
  vibrateSuccess: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 50, 50]); // Short double-vibration pattern for success
    }
  },
  vibrateError: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([100, 50, 100]); // Longer pattern for error
    }
  },
  vibrateTap: () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20); // Very short tap
    }
  }
};
