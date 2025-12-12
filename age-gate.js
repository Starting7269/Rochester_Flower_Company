// MINIMAL TEST - Just one alert
alert('SCRIPT LOADED - If you see this, JavaScript is executing');

// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
  alert('DOM READY');
  
  var btn = document.getElementById('btn-yes');
  if (btn) {
    alert('BUTTON FOUND');
    
    btn.addEventListener('click', function() {
      alert('BUTTON CLICKED!');
      window.location.href = 'index.html';
    });
    
    alert('LISTENER ADDED');
  } else {
    alert('BUTTON NOT FOUND!');
  }
});
