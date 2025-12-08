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

  // Change these to your actual email pieces
  var user = "info";         // before the @
  var domain = "rochesterflowercompany"; // without TLD
  var tld = "com";

  button.addEventListener("click", function () {
    var address = user + "@" + domain + "." + tld;
    var subject = encodeURIComponent("Rochester Flower Company – Request / Question");
    var body = encodeURIComponent(
      "Hi,\n\n" +
      "I'm reaching out because I rely on cannabis for relief but struggle to afford it.\n\n" +
      "Age (must be 21+):\n" +
      "General location:\n" +
      "How cannabis helps me:\n\n" +
      "Anything else you'd like to know:\n\n" +
      "Thanks for your time.\n"
    );

    window.location.href = "mailto:" + address + "?subject=" + subject + "&body=" + body;
  });
})();
