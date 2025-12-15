/**
 * Rochester Flower Company - Contact Form
 * Form validation, AJAX submission, and rate limiting
 */

(function() {
  'use strict';
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
  
  function initContactForm() {
    var form = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submitBtn');
    var successMessage = document.getElementById('successMessage');
    var errorMessage = document.getElementById('errorMessage');
    var rateLimitMessage = document.getElementById('rateLimitMessage');
    
    if (!form) {
      console.error('Contact form not found');
      return;
    }
    
    // Rate limiting configuration
    var RATE_LIMIT_KEY = 'rfc_form_submissions';
    var RATE_LIMIT_WINDOW = 3600000; // 1 hour in milliseconds
    var MAX_SUBMISSIONS = 3;
    
    /**
     * Check if user has exceeded rate limit
     */
    function checkRateLimit() {
      try {
        var now = Date.now();
        var submissionsJson = localStorage.getItem(RATE_LIMIT_KEY);
        var submissions = submissionsJson ? JSON.parse(submissionsJson) : [];
        
        var recentSubmissions = submissions.filter(function(timestamp) {
          return now - timestamp < RATE_LIMIT_WINDOW;
        });
        
        return recentSubmissions.length < MAX_SUBMISSIONS;
      } catch (error) {
        console.error('Rate limit check error:', error);
        return true; // Fail open
      }
    }
    
    /**
     * Record submission timestamp for rate limiting
     */
    function recordSubmission() {
      try {
        var now = Date.now();
        var submissionsJson = localStorage.getItem(RATE_LIMIT_KEY);
        var submissions = submissionsJson ? JSON.parse(submissionsJson) : [];
        
        submissions.push(now);
        
        var recentSubmissions = submissions.filter(function(timestamp) {
          return now - timestamp < RATE_LIMIT_WINDOW;
        });
        
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
      } catch (error) {
        console.error('Failed to record submission:', error);
      }
    }
    
    /**
     * Form submission handler
     */
    form.addEventListener('submit', async function(e) {
      e.preventDefault(); // Prevent default form submission
      
      var isValid = true;
      
      // Clear previous errors
      var errorGroups = form.querySelectorAll('.form-group.error');
      errorGroups.forEach(function(group) {
        group.classList.remove('error');
      });
      
      // Hide any previous messages
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';
      rateLimitMessage.style.display = 'none';
      
      // Check rate limit FIRST
      if (!checkRateLimit()) {
        rateLimitMessage.style.display = 'block';
        rateLimitMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      
      // Validate name
      var nameInput = document.getElementById('name');
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('error');
        isValid = false;
      }
      
      // Validate email
      var emailInput = document.getElementById('email');
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value)) {
        emailInput.closest('.form-group').classList.add('error');
        isValid = false;
      }
      
      // Validate location
      var locationInput = document.getElementById('location');
      if (!locationInput.value.trim()) {
        locationInput.closest('.form-group').classList.add('error');
        isValid = false;
      }
      
      // Validate message (minimum 20 characters)
      var messageInput = document.getElementById('message');
      if (messageInput.value.trim().length < 20) {
        messageInput.closest('.form-group').classList.add('error');
        isValid = false;
      }
      
      if (!isValid) {
        // Scroll to first error
        var firstError = form.querySelector('.form-group.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
      
      // Disable submit button to prevent double submission
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      // Submit form via AJAX
      try {
        var response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Record submission for rate limiting
          recordSubmission();
          
          // Show success message
          successMessage.style.display = 'block';
          form.reset();
          
          // Scroll to success message
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Re-enable button after success
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error message
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
    
    /**
     * Real-time validation feedback
     */
    var inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        var group = this.closest('.form-group');
        
        if (this.id === 'email') {
          var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(this.value)) {
            group.classList.add('error');
          } else {
            group.classList.remove('error');
          }
        } else if (this.id === 'message') {
          if (this.value.trim().length < 20) {
            group.classList.add('error');
          } else {
            group.classList.remove('error');
          }
        } else if (this.hasAttribute('required')) {
          if (!this.value.trim()) {
            group.classList.add('error');
          } else {
            group.classList.remove('error');
          }
        }
      });
    });
  }
  
})();
