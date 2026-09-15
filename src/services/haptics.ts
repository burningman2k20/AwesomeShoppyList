/**
 * Native Android haptic feedback vibration utility.
 * Triggers subtle vibration response on touch interactions in Android devices and PWAs.
 */
export function triggerHaptic(duration = 14) {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Some browsers restrict vibrate without direct user activation
    }
  }
}

export function triggerSuccessHaptic() {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([15, 50, 20]);
    } catch {
      // Ignore
    }
  }
}
