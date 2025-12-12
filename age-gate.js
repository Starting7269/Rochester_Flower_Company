/**
 * Enhanced Age Gate Verification
 * Rochester Flower Company
 * 
 * Special handling for Brave Android redirect blocking
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
   * Detect if running in Brave browser
   */
  function isBrave() {
    return (navigator.brave && typeof navigator.brave.isBrave === 'function') || 
           navigator.userAgent.toLowerCase().includes('brave');
  }
  
  /**
   * Check if crypto.subtle is available
   */
  function hasCryptoSupport() {
    return window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function';
  }
  
  /**
   * Fallback checksum for browsers without crypto.subtle
   */
  function simpleHash(str) {
    var hash = 0;
    if (str.length === 0) return hash.toString();
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Generate checksum for verification
   */
  async function generateChecksum(verified, timestamp) {
    const data = verified + timestamp + SECRET_SALT;
    
    if (hasCryptoSupport()) {
      try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        return simpleHash(data);
      }
    } else {
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
      
      if (!verified || !timestamp || !storedChecksum) {
        return false;
      }
      
      const expectedChecksum = await generateChecksum(verified, timestamp);
      if (storedChecksum !== expectedChecksum) {
        sessionStorage.clear();
        return false;
      }
      
      const timestampInt = parseInt(timestamp, 10);
      const age = Date.now() - timestampInt;
      
      if (isNaN(timestampInt) || age < 0 || age > MAX_AGE_MS) {
        sessionStorage.clear();
        return false;
      }
      
      return verified === 'true';
    } catch (error) {
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
   * Multiple redirect methods for Brave Android compatibility
   */
  function performRedirect(destination) {
    // Method 1: Try standard redirect
    try {
      window.location.href = destination;
      return;
    } catch (e) {
      // Continue to next method
    }
    
    // Method 2: Try replace (doesn't add to history)
    try {
      window.location.replace(destination);
      return;
    } catch (e) {
      // Continue to next method
    }
    
    // Method 3: Try assign
    try {
      window.location.assign(destination);
      return;
    } catch (e) {
      // Continue to next method
    }
    
    // Method 4: Direct property assignment
    try {
      window.location = destination;
      return;
    } catch (e) {
      // Continue to next method
    }
    
    // Method 5: Use anchor click (bypasses some redirect blocks)
    try {
      var link = document.createElement('a');
      link.href = destination;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      return;
    } catch (e) {
      // All methods failed
      alert('Unable to redirect. Please manually navigate to the home page.');
    }
  }
  
  /**
   * Redirect to age gate if not verified
   */
  async function checkAgeGate() {
    if (isAgeGatePage()) {
      return;
    }
    
    const isVerified = await verifyAgeVerification();
    
    if (!isVerified) {
      try {
        sessionStorage.setItem('intendedDestination', window.location.pathname);
      } catch (e) {
        // Ignore
      }
      performRedirect('age-gate.html');
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
      return;
    }
    
    let clickCount = 0;
    const MAX_CLICKS = 5;
    let isProcessing = false;
    
    // Detect Brave Android
    const isBraveAndroid = isBrave() && /android/i.test(navigator.userAgent);
    
    // YES button
    btnYes.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (isProcessing) {
        return;
      }
      
      clickCount++;
      if (clickCount > MAX_CLICKS) {
        alert('Too many attempts. Please refresh the page.');
        btnYes.disabled = true;
        return;
      }
      
      isProcessing = true;
      btnYes.disabled = true;
      btnYes.textContent = 'Verifying...';
      
      try {
        const success = await setAgeVerification();
        
        if (!success) {
          throw new Error('Failed to set age verification');
        }
        
        // Get destination
        let destination = 'index.html';
        try {
          const intended = sessionStorage.getItem('intendedDestination');
          if (intended && intended !== '/age-gate.html' && intended !== '/age-gate') {
            destination = intended;
          }
          sessionStorage.removeItem('intendedDestination');
        } catch (e) {
          // Use default
        }
        
        // For Brave Android, use immediate redirect without setTimeout
        if (isBraveAndroid) {
          // Brave Android: redirect immediately
          performRedirect(destination);
        } else {
          // Other browsers: small delay for UX
          setTimeout(function() {
            performRedirect(destination);
          }, 300);
        }
        
      } catch (error) {
        btnYes.disabled = false;
        btnYes.textContent = "I'm 21 or Older";
        isProcessing = false;
        alert('Verification failed. Please try again.');
      }
    });
    
    // NO button
    btnNo.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        sessionStorage.clear();
      } catch (e) {
        // Ignore
      }
      
      performRedirect('https://www.google.com');
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
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
