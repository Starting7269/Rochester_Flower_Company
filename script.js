// Set footer year
(function setYear() {
  var yearElem = document.getElementById("year");
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
})();

// Mobile nav toggle
(function navToggle() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
})();

// Obfuscated email button (contact page)
(function emailButton() {
  var button = document.getElementById("emailButton");
  if (!button) return;

  var user = "info";                     // before the @
  var domain = "rochesterflowercompany"; // without TLD
  var tld = "com";

  button.addEventListener("click", function () {
    var address = user + "@" + domain + "." + tld;
    var subject = encodeURIComponent("Rochester Flower Company – Reaching Out");
    var body = encodeURIComponent(
      "What can i help you with?:\n\n" +
      "Age (must be 21+):\n" +
      "General area (city/region):\n"
    );

    window.location.href = "mailto:" + address + "?subject=" + subject + "&body=" + body;
  });
})();
