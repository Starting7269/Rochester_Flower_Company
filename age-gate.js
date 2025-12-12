/**
 * Enhanced Age Gate Verification
 * Rochester Flower Company
 * 
 * Security improvements with mobile browser compatibility
 */

(function() {
  'use strict';
  
  const SECRET_SALT = 'rfc-age-verify-v2-' + window.location.hostname;
  const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
  const STORAGE_KEYS = {
    verified: 'ageVerified',
    timestamp: 'ageTimestamp',
    checksum: 'ageChecksum'
  };
  
  /**
   * Check if crypto.subtle is available
   */
  function hasCryptoSupport() {
    return window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function';
  }
  
  /**
   * Fallback checksum for browsers without crypto.subtle
   * Simple hash function - not cryptographically secure but better than nothing
   */
  function simpleHash(str) {
    var hash = 0;
    if (str.length === 0) return hash.toString();
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Generate checksum for verification
   */
  async function generateChecksum(verified, timestamp) {
    const data = verified + timestamp + SECRET_SALT;
    
    // Try to use crypto.subtle if available
    if (hasCryptoSupport()) {
      try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        console.warn('crypto.subtle failed, using fallback:', error);
        return simpleHash(data);
      }
    } else {
      // Fallback for browsers without crypto.subtle (older mobile browsers)
      return simpleHash(data);
    }
  }
  
  /**
   * Verify age verification integrity
   */
  async function verifyAgeVerification() {
    try {
      const verified = sessionStorage.getItem(STORAGE_KEYS.verified);
      const timestamp = sessionStorage.getItem(STORAGE_KEYS.timestamp);
      const storedChecksum = sessionStorage.getItem(STORAGE_KEYS.checksum);
      
      // Check all values exist
      if (!verified || !timestamp || !storedChecksum) {
        return false;
      }
      
      // Verify checksum
      const expectedChecksum = await generateChecksum(verified, timestamp);
      if (storedChecksum !== expectedChecksum) {
        console.warn('Age verification checksum mismatch - clearing session');
        sessionStorage.clear();
        return false;
      }
      
      // Verify timestamp is valid and not too old
      const timestampInt = parseInt(timestamp, 10);
      const age = Date.now() - timestampInt;
      
      if (isNaN(timestampInt) || age < 0 || age > MAX_AGE_MS) {
        console.warn('Age verification expired or invalid - clearing session');
        sessionStorage.clear();
        return false;
      }
      
      return verified === 'true';
    } catch (error) {
      console.error('Age verification error:', error);
      sessionStorage.clear();
      return false;
    }
  }
  
  /**
   * Set age verification
   */
  async function setAgeVerification() {
    try {
      const timestamp = Date.now().toString();
      const verified = 'true';
      const checksum = await generateChecksum(verified, timestamp);
      
      sessionStorage.setItem(STORAGE_KEYS.verified, verified);
      sessionStorage.setItem(STORAGE_KEYS.timestamp, timestamp);
      sessionStorage.setItem(STORAGE_KEYS.checksum, checksum);
      
      return true;
    } catch (error) {
      console.error('Failed to set age verification:', error);
      return false;
    }
  }
  
  /**
   * Check if we're on the age gate page
   */
  function isAgeGatePage() {
    return window.location.pathname.endsWith('age-gate.html') || 
           window.location.pathname.endsWith('age-gate') ||
           window.location.pathname === '/age-gate.html' ||
           window.location.pathname === '/age-gate';
  }
  
  /**
   * Redirect to age gate if not verified
   */
  async function checkAgeGate() {
    if (isAgeGatePage()) {
      return; // Don't redirect if already on gate page
    }
    
    const isVerified = await verifyAgeVerification();
    
    if (!isVerified) {
      // Store intended destination
      try {
        sessionStorage.setItem('intendedDestination', window.location.pathname);
      } catch (e) {
        console.warn('Could not store intended destination:', e);
      }
      window.location.href = 'age-gate.html';
    }
  }
  
  /**
   * Initialize age gate on gate page
   */
  function initAgeGate() {
    if (!isAgeGatePage()) {
      return;
    }
    
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    
    if (!btnYes || !btnNo) {
      console.error('Age gate buttons not found');
      return;
    }
    
    let clickCount = 0;
    const MAX_CLICKS = 5;
    let isProcessing = false; // Prevent double-clicks
    
    // Handle "Yes" button
    btnYes.addEventListener('click', async function(e) {
      e.preventDefault(); // Prevent any default behavior
      
      // Prevent double-clicks
      if (isProcessing) {
        console.log('Already processing, ignoring click');
        return;
      }
      
      // Rate limiting
      clickCount++;
      if (clickCount > MAX_CLICKS) {
        alert('Too many attempts. Please refresh the page.');
        btnYes.disabled = true;
        return;
      }
      
      isProcessing = true;
      
      // Disable button immediately
      btnYes.disabled = true;
      btnYes.textContent = 'Verifying...';
      
      try {
        // Set verification
        const success = await setAgeVerification();
        
        if (!success) {
          throw new Error('Failed to set age verification');
        }
        
        // Small delay for UX
        setTimeout(function() {
          // Check for intended destination
          let destination = 'index.html';
          try {
            const intended = sessionStorage.getItem('intendedDestination');
            if (intended && intended !== '/age-gate.html' && intended !== '/age-gate') {
              destination = intended;
            }
            // Clear intended destination
            sessionStorage.removeItem('intendedDestination');
          } catch (e) {
            console.warn('Could not retrieve intended destination:', e);
          }
          
          // Redirect
          window.location.href = destination;
        }, 300);
        
      } catch (error) {
        console.error('Age verification failed:', error);
        // Re-enable button on error
        btnYes.disabled = false;
        btnYes.textContent = "I'm 21 or Older";
        isProcessing = false;
        alert('Verification failed. Please try again.');
      }
    });
    
    // Handle "No" button
    btnNo.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Clear any verification
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear session storage:', e);
      }
      
      // Redirect away
      window.location.href = 'https://www.google.com';
    });
  }
  
  /**
   * Frame busting
   */
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
  
  /**
   * Initialize based on page
   */
  function init() {
    if (isAgeGatePage()) {
      initAgeGate();
    } else {
      checkAgeGate();
    }
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
