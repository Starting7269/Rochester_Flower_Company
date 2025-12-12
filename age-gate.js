/**
 * DIAGNOSTIC VERSION - Tests if JavaScript loads at all
 */

// Alert immediately when script loads
alert('JavaScript file loaded! If you see this, the file is loading.');

(function() {
  'use strict';
  
  const SECRET_SALT = 'rfc-age-verify-v2-' + window.location.hostname;
  const MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const STORAGE_KEYS = {
    verified: 'ageVerified',
    timestamp: 'ageTimestamp',
    checksum: 'ageChecksum'
  };
  
  async function generateChecksum(verified, timestamp) {
    const data = verified + timestamp + SECRET_SALT;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
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
  
  async function setAgeVerification() {
    const timestamp = Date.now().toString();
    const verified = 'true';
    const checksum = await generateChecksum(verified, timestamp);
    
    sessionStorage.setItem(STORAGE_KEYS.verified, verified);
    sessionStorage.setItem(STORAGE_KEYS.timestamp, timestamp);
    sessionStorage.setItem(STORAGE_KEYS.checksum, checksum);
  }
  
  function isAgeGatePage() {
    return window.location.pathname.endsWith('age-gate.html') || 
           window.location.pathname.endsWith('age-gate');
  }
  
  async function checkAgeGate() {
    if (isAgeGatePage()) {
      return;
    }
    
    const isVerified = await verifyAgeVerification();
    
    if (!isVerified) {
      sessionStorage.setItem('intendedDestination', window.location.pathname);
      window.location.href = 'age-gate.html';
    }
  }
  
  function initAgeGate() {
    if (!isAgeGatePage()) {
      return;
    }
    
    // Alert to confirm we got here
    alert('initAgeGate() called - about to find buttons');
    
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    
    if (!btnYes || !btnNo) {
      alert('ERROR: Buttons not found!');
      return;
    }
    
    alert('Buttons found! Adding event listeners...');
    
    let clickCount = 0;
    const MAX_CLICKS = 5;
    
    // Try BOTH click and touchend events
    function handleYesClick() {
      alert('YES button handler called!');
      
      clickCount++;
      if (clickCount > MAX_CLICKS) {
        alert('Too many attempts. Please refresh the page.');
        btnYes.disabled = true;
        return;
      }
      
      btnYes.disabled = true;
      btnYes.textContent = 'Verifying...';
      
      // Use a simpler approach without async
      setTimeout(function() {
        try {
          // Simple storage without checksum for testing
          sessionStorage.setItem('ageVerified', 'true');
          sessionStorage.setItem('ageTimestamp', Date.now().toString());
          
          const intended = sessionStorage.getItem('intendedDestination');
          const destination = intended && intended !== '/age-gate.html' ? intended : 'index.html';
          sessionStorage.removeItem('intendedDestination');
          
          window.location.href = destination;
        } catch (error) {
          alert('Error: ' + error.message);
        }
      }, 300);
    }
    
    function handleNoClick() {
      alert('NO button clicked');
      sessionStorage.clear();
      window.location.href = 'https://www.google.com';
    }
    
    // Add multiple event types for maximum compatibility
    btnYes.addEventListener('click', handleYesClick);
    btnYes.addEventListener('touchend', function(e) {
      e.preventDefault();
      handleYesClick();
    });
    
    btnNo.addEventListener('click', handleNoClick);
    btnNo.addEventListener('touchend', function(e) {
      e.preventDefault();
      handleNoClick();
    });
    
    alert('Event listeners added successfully!');
  }
  
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
  
  function init() {
    alert('init() called, readyState: ' + document.readyState);
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
