// Set footer year
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

// Enhanced contact button with rate limiting and better security
(function contactButton() {
  var button = document.getElementById("emailButton");
  if (!button) return;

  var lastClickTime = 0;
  var COOLDOWN_MS = 3000; // 3 second cooldown
  
  // Enhanced age verification check with integrity
  function verifyAge() {
    var timestamp = sessionStorage.getItem('ageTimestamp');
    var verified = sessionStorage.getItem('ageVerified');
    
    if (!timestamp || !verified) return false;
    
    // Basic integrity check - verify timestamp is reasonable (within last 24 hours)
    var age = Date.now() - parseInt(timestamp, 10);
    var ONE_DAY = 24 * 60 * 60 * 1000;
    
    return verified === 'true' && age < ONE_DAY && age > 0;
  }

  button.addEventListener("click", function (e) {
    e.preventDefault();
    
    // Verify age first
    if (!verifyAge()) {
      alert("Please verify your age first.");
      window.location.href = 'age-gate.html';
      return;
    }
    
    // Rate limiting
    var now = Date.now();
    if (now - lastClickTime < COOLDOWN_MS) {
      alert("Please wait a moment before contacting again.");
      return;
    }
    lastClickTime = now;
    
    // Build contact information securely
    // Note: This still exposes email in JS, but with rate limiting
    // For maximum security, consider using Formspree instead
    var parts = {
      user: "info",
      domain: "rochesterflowercompany",
      tld: "com"
    };
    
    var address = parts.user + "@" + parts.domain + "." + parts.tld;
    var subject = encodeURIComponent("Rochester Flower Company – Inquiry");
    var body = encodeURIComponent(
      "Please tell me about yourself:\n\n" +
      "Age (must be 21+):\n" +
      "General area in Rochester region:\n" +
      "How cannabis helps you:\n"
    );

    window.location.href = "mailto:" + address + "?subject=" + subject + "&body=" + body;
  });
})();

// Age gate redirect check for all pages except age-gate.html
(function ageGateCheck() {
  // Don't run on the age gate page itself
  if (window.location.pathname.endsWith('age-gate.html')) {
    return;
  }

  // Enhanced age verification with timestamp
  var timestamp = sessionStorage.getItem('ageTimestamp');
  var verified = sessionStorage.getItem('ageVerified');
  
  if (!timestamp || !verified || verified !== 'true') {
    // Redirect to age gate
    window.location.href = 'age-gate.html';
    return;
  }
  
  // Check if verification is stale (older than 24 hours)
  var age = Date.now() - parseInt(timestamp, 10);
  var ONE_DAY = 24 * 60 * 60 * 1000;
  
  if (age > ONE_DAY || age < 0) {
    // Verification is too old or timestamp is invalid
    sessionStorage.clear();
    window.location.href = 'age-gate.html';
  }
})();

// Security: Prevent common attacks
(function securityMeasures() {
  // Disable right-click context menu on sensitive images (optional)
  // Uncomment if you want to protect your logo
  /*
  var logos = document.querySelectorAll('.brand-logo, .hero-logo-big');
  logos.forEach(function(logo) {
    logo.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
  });
  */
  
  // Prevent frame embedding (defense in depth beyond X-Frame-Options)
  if (window.self !== window.top) {
    window.top.location = window.self.location;
  }
  
  // Clear sessionStorage on unload for privacy (optional - may be too aggressive)
  // Uncomment if you want users to re-verify age every time they close the browser
  /*
  window.addEventListener('beforeunload', function() {
    sessionStorage.clear();
  });
  */
})();