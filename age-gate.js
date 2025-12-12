/**
 * Enhanced Age Gate Verification
 * Rochester Flower Company
 * 
 * Security improvements:
 * - Checksum verification
 * - Enhanced timestamp validation
 * - Rate limiting
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
   * Generate checksum for verification
   */
  async function generateChecksum(verified, timestamp) {
    const data = verified + timestamp + SECRET_SALT;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const timestamp = Date.now().toString();
    const verified = 'true';
    const checksum = await generateChecksum(verified, timestamp);
    
    sessionStorage.setItem(STORAGE_KEYS.verified, verified);
    sessionStorage.setItem(STORAGE_KEYS.timestamp, timestamp);
    sessionStorage.setItem(STORAGE_KEYS.checksum, checksum);
  }
  
  /**
   * Check if we're on the age gate page
   */
  function isAgeGatePage() {
    return window.location.pathname.endsWith('age-gate.html') || 
           window.location.pathname.endsWith('age-gate');
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
      sessionStorage.setItem('intendedDestination', window.location.pathname);
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
    
    btnYes.addEventListener('click', async function() {
      // Rate limiting
      clickCount++;
      if (clickCount > MAX_CLICKS) {
        alert('Too many attempts. Please refresh the page.');
        btnYes.disabled = true;
        return;
      }
      
      // Set verification
      await setAgeVerification();
      
      // Disable button to prevent double-click
      btnYes.disabled = true;
      btnYes.textContent = 'Verifying...';
      
      // Small delay for UX
      setTimeout(function() {
        // Check for intended destination
        const intended = sessionStorage.getItem('intendedDestination');
        const destination = intended && intended !== '/age-gate.html' 
          ? intended 
          : 'index.html';
        
        // Clear intended destination
        sessionStorage.removeItem('intendedDestination');
        
        window.location.href = destination;
      }, 300);
    });
    
    btnNo.addEventListener('click', function() {
      // Clear any verification
      sessionStorage.clear();
      
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
      if (isAgeGatePage()) {
        initAgeGate();
      } else {
        await checkAgeGate();
      }
    });
  } else {
    if (isAgeGatePage()) {
      initAgeGate();
    } else {
      checkAgeGate();
    }
  }
  
})();
