/**
 * Plants Blog - Category Filtering
 * Rochester Flower Company
 * 
 * Handles category filtering via URL parameters for the Plants blog page.
 * This script runs on /plants/ and /plants/page/X pages.
 */

(function plantsFilter() {
  'use strict';
  
  // Only run on plants pages
  if (!window.location.pathname.includes('/plants')) {
    return;
  }
  
  // Category filtering via URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const activeCategory = urlParams.get('category');
  
  if (activeCategory) {
    // Highlight active filter button
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      if (btn.dataset.category === activeCategory) {
        btn.classList.add('active');
      }
    });
    
    // Filter posts
    document.querySelectorAll('.post-card').forEach(card => {
      const categories = card.dataset.categories.split(',');
      if (!categories.includes(activeCategory)) {
        card.style.display = 'none';
      }
    });
  } else {
    // Show "All Posts" as active when no filter
    const filterAll = document.getElementById('filter-all');
    if (filterAll) {
      filterAll.classList.add('active');
    }
  }
})();
