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

// Obfuscated email button with better security
(function emailButton() {
  var button = document.getElementById("emailButton");
  if (!button) return;

  // Obfuscated parts
  var parts = {
    user: "info",
    domain: "rochesterflowercompany",
    tld: "com"
  };

  button.addEventListener("click", function () {
    // Build email address from parts
    var address = parts.user + "@" + parts.domain + "." + parts.tld;
    
    var subject = encodeURIComponent("Rochester Flower Company – Reaching Out");
    var body = encodeURIComponent(
      "What can I help you with?:\n\n" +
      "Age (must be 21+):\n" +
      "General area (city/region):\n"
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

  // Check if age has been verified
  var ageVerified = sessionStorage.getItem('ageVerified');
  
  if (ageVerified !== 'true') {
    // Redirect to age gate
    window.location.href = 'age-gate.html';
  }
})();