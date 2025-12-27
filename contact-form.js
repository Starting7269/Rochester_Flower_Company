/**
 * Rochester Flower Company - Contact Form
 * Form validation and submission to Cloudflare Worker
 */

(function() {
  'use strict';
  
  // IMPROVED: Named constants instead of magic numbers
  const RATE_LIMIT_KEY = 'rfc_form_submissions';
  const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const MAX_SUBMISSIONS = 3;
  const MIN_MESSAGE_LENGTH = 20;
  
  // IMPORTANT: Update this to your Cloudflare Worker URL after deployment
  // It will be something like: https://contact-form.yourusername.workers.dev
  // OR if you set up a route: https://rochesterflowercompany.com/api/contact
  const WORKER_ENDPOINT = 'https://rochesterflowercompany.com/api/contact';
  
  // IMPROVED: More robust email validation regex
  const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
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
    
    /**
     * Check if user has exceeded rate limit
     */
    function checkRateLimit() {
      try {
        var now = Date.now();
        var submissionsJson = localStorage.getItem(RATE_LIMIT_KEY);
        var submissions = submissionsJson ? JSON.parse(submissionsJson) : [];
        
        var recentSubmissions = submissions.filter(function(timestamp) {
          return now - timestamp < RATE_LIMIT_WINDOW_MS;
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
          return now - timestamp < RATE_LIMIT_WINDOW_MS;
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
      
      // IMPROVED: Use more robust email validation
      var emailInput = document.getElementById('email');
      if (!EMAIL_PATTERN.test(emailInput.value)) {
        emailInput.closest('.form-group').classList.add('error');
        isValid = false;
      }
      
      // Validate message (minimum length defined in constant)
      var messageInput = document.getElementById('message');
      if (messageInput.value.trim().length < MIN_MESSAGE_LENGTH) {
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
      
      // Submit form via AJAX to Cloudflare Worker
      try {
        var response = await fetch(WORKER_ENDPOINT, {
          method: 'POST',
          body: new FormData(form),
          // No need for extra headers - FormData sets the right content-type
        });
        
        var result = await response.json();
        
        if (response.ok && result.success) {
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
          throw new Error(result.error || 'Form submission failed');
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
          // IMPROVED: Use more robust email pattern
          if (!EMAIL_PATTERN.test(this.value)) {
            group.classList.add('error');
          } else {
            group.classList.remove('error');
          }
        } else if (this.id === 'message') {
          if (this.value.trim().length < MIN_MESSAGE_LENGTH) {
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
