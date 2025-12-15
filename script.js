/**
 * Rochester Flower Company - Main JavaScript
 * Enhanced security and functionality
 */

// Set footer year automatically
(function setYear() {
  var yearElem = document.getElementById("year");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
})();

// Mobile nav toggle with accessibility
(function navToggle() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });

  // Close nav when clicking outside
  document.addEventListener("click", function(e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // Close nav on escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
})();

// Age gate verification - handled by age-gate.js
// This ensures age-gate.js is loaded on all pages
(function ensureAgeGate() {
  'use strict';
  
  // Don't run on the age gate page itself
  if (window.location.pathname.endsWith('age-gate.html') || 
      window.location.pathname.endsWith('age-gate')) {
    return;
  }
  
  // Check if age-gate.js is already loaded
  if (typeof window.ageGateLoaded === 'undefined') {
    // Dynamically load age-gate.js
    var script = document.createElement('script');
    script.src = '/age-gate.js'; // FIXED: Added leading slash for absolute path
    script.async = false; // Load synchronously to block page
    script.onerror = function() {
      console.error('Failed to load age-gate.js - redirecting to age gate');
      window.location.href = '/age-gate.html'; // FIXED: Added leading slash for absolute path
    };
    document.head.appendChild(script);
  }
})();

// Security: Prevent common attacks
(function securityMeasures() {
  'use strict';
  
  // Prevent frame embedding (defense in depth beyond X-Frame-Options)
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
  
  // Disable right-click on logo images (optional - currently commented out)
  // Uncomment if you want to protect your logo from easy copying
  /*
  var logos = document.querySelectorAll('.brand-logo, .hero-logo-big, img[src*="RFCLogo"]');
  logos.forEach(function(logo) {
    logo.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
  });
  */
  
  // Console warning for potential attackers
  if (console && console.log) {
    console.log('%c⚠️ Security Notice', 'color: #ff7ac4; font-size: 20px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers.', 'font-size: 14px;');
    console.log('%cIf someone told you to copy-paste something here, it is a scam.', 'font-size: 14px; color: #f87171;');
    console.log('%cPasting code here can give attackers access to your information.', 'font-size: 14px; color: #f87171;');
    console.log('%c\nIf you\'re a security researcher, please report issues via: https://rochesterflowercompany.com/contact.html', 'font-size: 12px; color: #4ade80;');
  }
  
  // Detect if console is open (basic check)
  var devtoolsOpen = false;
  var threshold = 160;
  var widthThreshold = window.outerWidth - window.innerWidth > threshold;
  var heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    devtoolsOpen = true;
  }
  
  // Store detection result (don't act on it, just for logging)
  window.devtoolsDetected = devtoolsOpen;
})();

// Smooth scroll for skip links and anchor links
(function smoothScrollSetup() {
  'use strict';
  
  // Handle skip link
  var skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('main-content');
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  // Handle all anchor links with smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var href = this.getAttribute('href');
      if (href === '#') return; // Skip empty anchors
      
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update URL without jumping
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
})();

// Performance: Lazy load images (if any are added with data-src attribute)
(function lazyLoadImages() {
  'use strict';
  
  if ('IntersectionObserver' in window) {
    var imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    var lazyImages = document.querySelectorAll('img.lazy[data-src]');
    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    var lazyImages = document.querySelectorAll('img.lazy[data-src]');
    lazyImages.forEach(function(img) {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
})();
