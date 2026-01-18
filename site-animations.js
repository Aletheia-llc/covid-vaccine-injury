/**
 * COVID Vaccine Injuries Site - Animations
 * ==========================================
 * 
 * Drop this file into your Next.js project and import it in your layout or page.
 * 
 * USAGE IN NEXT.JS:
 * -----------------
 * Option 1: In app/layout.tsx or pages/_app.tsx
 *   import '@/lib/site-animations.js'
 * 
 * Option 2: Using next/script in layout
 *   <Script src="/site-animations.js" strategy="afterInteractive" />
 * 
 * Option 3: Call initAllAnimations() manually after component mounts
 *   useEffect(() => { initAllAnimations(); }, []);
 * 
 * REQUIRED HTML STRUCTURE:
 * ------------------------
 * Hero stats need these IDs:
 *   - id="stat-claims" (for 14,046)
 *   - id="stat-compensated" (for 42)
 *   - id="stat-cicp-rate" (for 0.3%)
 *   - id="stat-vicp-rate" (for ~48%)
 * 
 * Hero lines need these classes:
 *   - .hero-line.line-1, .hero-line.line-2, .hero-line.line-3
 * 
 * Outlier section needs:
 *   - .outlier-bar-container with .outlier-portion and .others-portion inside
 * 
 * Comparison section needs:
 *   - .outlier-comparison with .cicp-bar and .vicp-bar inside
 * 
 * Funnel section needs:
 *   - .funnel-stage[data-stage="xxx"] and #detail-xxx for each stage
 */

(function() {
  'use strict';

  // ============================================
  // UTILITY: Check if element exists
  // ============================================
  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  // ============================================
  // COUNTER ANIMATIONS
  // ============================================
  
  /**
   * Animate a number counting up with easing
   * @param {HTMLElement} element - Target element
   * @param {number} target - Final number
   * @param {number} duration - Animation duration in ms
   * @param {string} prefix - Text before number (e.g., "$")
   * @param {string} suffix - Text after number (e.g., "%", "M")
   */
  function animateCounter(element, target, duration = 2000, prefix = '', suffix = '') {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuart for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (target - start) * easeOutQuart);
      
      element.textContent = prefix + current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Add pulse effect when complete
        element.classList.add('counting');
        setTimeout(() => element.classList.remove('counting'), 300);
      }
    }
    
    requestAnimationFrame(update);
  }

  /**
   * Animate a decimal number (e.g., 0.3, 1.6)
   */
  function animateDecimal(element, target, duration = 2000, suffix = '', decimals = 1) {
    if (!element) return;
    
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = (target * easeOutQuart).toFixed(decimals);
      
      element.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.classList.add('counting');
        setTimeout(() => element.classList.remove('counting'), 300);
      }
    }
    
    requestAnimationFrame(update);
  }

  /**
   * Animate a percentage that starts with "~" (e.g., "~48%")
   */
  function animateApproxPercent(element, target, duration = 2000) {
    if (!element) return;
    
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(target * easeOutQuart);
      
      element.textContent = '~' + current + '%';
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.classList.add('counting');
        setTimeout(() => element.classList.remove('counting'), 300);
      }
    }
    
    requestAnimationFrame(update);
  }

  // ============================================
  // HERO STATS ANIMATION
  // ============================================
  
  function animateHeroStats() {
    const stats = [
      { id: 'stat-claims', value: 14046, type: 'integer', suffix: '' },
      { id: 'stat-compensated', value: 42, type: 'integer', suffix: '' },
      { id: 'stat-cicp-rate', value: 0.3, type: 'decimal', suffix: '%' },
      { id: 'stat-vicp-rate', value: 48, type: 'approx', suffix: '%' }
    ];

    // Reset all to 0 first
    stats.forEach(stat => {
      const element = document.getElementById(stat.id);
      if (element) {
        if (stat.type === 'approx') {
          element.textContent = '~0%';
        } else if (stat.type === 'decimal') {
          element.textContent = '0' + stat.suffix;
        } else {
          element.textContent = '0';
        }
      }
    });

    // Animate each with staggered timing
    stats.forEach((stat, index) => {
      const element = document.getElementById(stat.id);
      if (!element) return;
      
      setTimeout(() => {
        if (stat.type === 'decimal') {
          animateDecimal(element, stat.value, 2000, stat.suffix);
        } else if (stat.type === 'approx') {
          animateApproxPercent(element, stat.value, 2000);
        } else {
          animateCounter(element, stat.value, 2000, '', stat.suffix);
        }
      }, index * 200 + 1200); // Stagger after headline animation
    });
  }

  // ============================================
  // HERO LINE REVEAL ANIMATION
  // ============================================
  
  function animateHeroLines() {
    const lines = $$('.hero-line');
    
    lines.forEach((line, index) => {
      // Reset state
      line.style.opacity = '0';
      line.style.transform = 'translateY(30px)';
      
      // Stagger the animations
      setTimeout(() => {
        line.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      }, 200 + (index * 300)); // 200ms, 500ms, 800ms
    });
  }

  // ============================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================
  
  /**
   * Animate the outlier bars (91% / 9% split)
   */
  function animateOutlierBars() {
    const barContainer = $('.outlier-bar-container');
    if (!barContainer) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const outlierBar = entry.target.querySelector('.outlier-portion');
          const othersBar = entry.target.querySelector('.others-portion');
          
          if (outlierBar && othersBar) {
            // Start at 0 width
            outlierBar.style.width = '0%';
            othersBar.style.width = '0%';
            outlierBar.style.transition = 'width 1s ease-out';
            othersBar.style.transition = 'width 1s ease-out 0.3s';
            
            // Animate to final widths
            setTimeout(() => {
              outlierBar.style.width = '91%';
              othersBar.style.width = '9%';
            }, 100);
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(barContainer);
  }

  /**
   * Animate the CICP vs VICP comparison bars
   */
  function animateComparisonBars() {
    const comparison = $('.outlier-comparison, .payment-comparison');
    if (!comparison) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cicpBar = entry.target.querySelector('.cicp-bar, [class*="cicp"]');
          const vicpBar = entry.target.querySelector('.vicp-bar, [class*="vicp"]');
          
          if (cicpBar) {
            cicpBar.style.width = '0%';
            cicpBar.style.transition = 'width 0.8s ease-out';
            setTimeout(() => {
              cicpBar.style.width = cicpBar.dataset.width || '1%';
            }, 300);
          }
          
          if (vicpBar) {
            vicpBar.style.width = '0%';
            vicpBar.style.transition = 'width 1s ease-out';
            setTimeout(() => {
              vicpBar.style.width = vicpBar.dataset.width || '100%';
            }, 600);
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(comparison);
  }

  /**
   * Animate the funnel stages
   */
  function animateFunnelBars() {
    const funnelStages = $$('.funnel-stage .funnel-bar, .funnel-bar');
    if (!funnelStages.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.dataset.width || bar.style.width || '100%';
          
          bar.style.width = '0%';
          bar.style.transition = 'width 0.8s ease-out';
          
          setTimeout(() => {
            bar.style.width = targetWidth;
          }, 100);
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    funnelStages.forEach(bar => {
      // Store original width
      if (!bar.dataset.width) {
        bar.dataset.width = bar.style.width || '100%';
      }
      observer.observe(bar);
    });
  }

  /**
   * Animate trust fund visualization
   */
  function animateTrustFundBars() {
    const trustFundViz = $('.trustfund-viz, .trust-fund-container, [class*="trust-fund"]');
    if (!trustFundViz) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const covidBar = entry.target.querySelector('[class*="covid"], [class*="used"]');
          const remainingBar = entry.target.querySelector('[class*="remaining"], [class*="available"]');
          
          if (covidBar) {
            const targetHeight = covidBar.dataset.height || covidBar.style.height || '38%';
            covidBar.style.height = '0%';
            covidBar.style.transition = 'height 1s ease-out';
            setTimeout(() => {
              covidBar.style.height = targetHeight;
            }, 200);
          }
          
          if (remainingBar) {
            const targetHeight = remainingBar.dataset.height || remainingBar.style.height || '62%';
            remainingBar.style.height = '0%';
            remainingBar.style.transition = 'height 1s ease-out 0.3s';
            setTimeout(() => {
              remainingBar.style.height = targetHeight;
            }, 200);
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(trustFundViz);
  }

  // ============================================
  // FUNNEL STAGE EXPAND/COLLAPSE
  // ============================================
  
  function initFunnelInteraction() {
    const stages = $$('.funnel-stage[data-stage]');
    
    stages.forEach(stage => {
      stage.style.cursor = 'pointer';
      
      stage.addEventListener('click', () => {
        const stageId = stage.dataset.stage;
        const detail = document.getElementById('detail-' + stageId);
        
        if (!detail) return;
        
        // Close all other details
        $$('.funnel-detail').forEach(d => {
          if (d !== detail) {
            d.classList.remove('show');
            d.style.maxHeight = '0';
            d.style.opacity = '0';
          }
        });
        
        // Toggle this one
        if (detail.classList.contains('show')) {
          detail.classList.remove('show');
          detail.style.maxHeight = '0';
          detail.style.opacity = '0';
        } else {
          detail.classList.add('show');
          detail.style.maxHeight = detail.scrollHeight + 'px';
          detail.style.opacity = '1';
        }
      });
    });
    
    // Set initial state for all details
    $$('.funnel-detail').forEach(detail => {
      detail.style.maxHeight = '0';
      detail.style.opacity = '0';
      detail.style.overflow = 'hidden';
      detail.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
    });
  }

  // ============================================
  // FADE IN ON SCROLL (Generic sections)
  // ============================================
  
  function initScrollFadeIn() {
    const sections = $$('section, .card, .comparison-card, .stat-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
      // Only add if not already visible
      if (!section.classList.contains('no-animate')) {
        section.classList.add('fade-in-section');
        observer.observe(section);
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = $(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }

  // ============================================
  // CALCULATOR LIVE UPDATES
  // ============================================
  
  function initCalculatorAnimations() {
    const sliders = $$('.calc-slider, input[type="range"]');
    
    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        // Find associated result cards
        const resultCards = $$('.result-card, .calc-result');
        resultCards.forEach(card => {
          card.style.transform = 'scale(1.02)';
          setTimeout(() => {
            card.style.transform = 'scale(1)';
          }, 150);
        });
      });
    });
  }

  // ============================================
  // TOAST NOTIFICATION
  // ============================================
  
  window.showToast = function(message, duration = 3000) {
    let toast = $('#toast');
    
    // Create toast if it doesn't exist
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #0d1b2a;
        color: white;
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    
    // Show
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });
    
    // Hide after duration
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.opacity = '0';
    }, duration);
  };

  // ============================================
  // INJECT REQUIRED CSS
  // ============================================
  
  function injectAnimationCSS() {
    const css = `
      /* Hero line reveal */
      .hero-line {
        opacity: 0;
        transform: translateY(30px);
      }
      
      /* Number pulse on complete */
      .counting {
        animation: numberPulse 0.3s ease !important;
      }
      
      @keyframes numberPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      
      /* Fade in on scroll */
      .fade-in-section {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .fade-in-section.fade-in-visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Funnel detail expand */
      .funnel-detail {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease;
      }
      
      .funnel-detail.show {
        max-height: 500px;
        opacity: 1;
      }
      
      /* Generic fade in up */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Bar transitions */
      .outlier-portion,
      .others-portion,
      .cicp-bar,
      .vicp-bar,
      .funnel-bar {
        transition: width 0.8s ease-out;
      }
      
      /* Result card pulse on update */
      .result-card,
      .calc-result {
        transition: transform 0.15s ease;
      }
      
      /* Hover lift effect */
      .comparison-card:hover,
      .stat-card:hover,
      .rep-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.12);
      }
    `;
    
    const style = document.createElement('style');
    style.id = 'site-animations-css';
    style.textContent = css;
    
    // Only inject if not already present
    if (!$('#site-animations-css')) {
      document.head.appendChild(style);
    }
  }

  // ============================================
  // MAIN INITIALIZATION
  // ============================================
  
  function initAllAnimations() {
    // Inject CSS first
    injectAnimationCSS();
    
    // Hero animations (immediate)
    animateHeroLines();
    
    // Hero stats (delayed to let lines finish)
    setTimeout(animateHeroStats, 500);
    
    // Scroll-triggered animations
    animateOutlierBars();
    animateComparisonBars();
    animateFunnelBars();
    animateTrustFundBars();
    
    // Interactive elements
    initFunnelInteraction();
    initCalculatorAnimations();
    initSmoothScroll();
    
    // Generic fade-in (optional, can be heavy)
    // initScrollFadeIn();
    
    console.log('✅ Site animations initialized');
  }

  // ============================================
  // AUTO-INITIALIZE
  // ============================================
  
  // Export for manual initialization
  window.initAllAnimations = initAllAnimations;
  window.animateCounter = animateCounter;
  window.animateDecimal = animateDecimal;
  window.showToast = window.showToast;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
  } else {
    // DOM already loaded
    initAllAnimations();
  }

  // Re-init on route change (for Next.js client-side navigation)
  if (typeof window !== 'undefined') {
    // Listen for Next.js route changes
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      setTimeout(initAllAnimations, 100);
    };
    
    window.addEventListener('popstate', () => {
      setTimeout(initAllAnimations, 100);
    });
  }

})();
