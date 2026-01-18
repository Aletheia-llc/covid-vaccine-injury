/**
 * COVID Vaccine Injuries Site - React Animation Hooks
 * ====================================================
 * 
 * USAGE:
 * ------
 * 1. Copy this file to: app/hooks/useAnimations.ts (or .js)
 * 
 * 2. In your page or layout component:
 * 
 *    import { useHeroAnimations, useScrollAnimations } from '@/hooks/useAnimations';
 *    
 *    export default function HomePage() {
 *      useHeroAnimations();
 *      useScrollAnimations();
 *      return ( ... );
 *    }
 * 
 * 3. Or use the all-in-one hook:
 * 
 *    import { useSiteAnimations } from '@/hooks/useAnimations';
 *    
 *    export default function HomePage() {
 *      useSiteAnimations();
 *      return ( ... );
 *    }
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

// ============================================
// COUNTER ANIMATION HOOK
// ============================================

/**
 * Animate a number counting up
 * @param ref - React ref to the element
 * @param target - Target number
 * @param duration - Animation duration in ms
 * @param options - { prefix, suffix, decimals, startOnMount }
 */
export function useCounterAnimation(
  ref: React.RefObject<HTMLElement>,
  target: number,
  duration: number = 2000,
  options: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    startOnMount?: boolean;
    delay?: number;
  } = {}
) {
  const { prefix = '', suffix = '', decimals = 0, startOnMount = true, delay = 0 } = options;
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    const element = ref.current;
    if (!element || hasAnimated.current) return;
    
    hasAnimated.current = true;
    const startTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      let current: string;
      if (decimals > 0) {
        current = (target * easeOutQuart).toFixed(decimals);
      } else {
        current = Math.floor(target * easeOutQuart).toLocaleString();
      }
      
      element.textContent = prefix + current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.classList.add('counting');
        setTimeout(() => element.classList.remove('counting'), 300);
      }
    }

    setTimeout(() => {
      requestAnimationFrame(update);
    }, delay);
  }, [ref, target, duration, prefix, suffix, decimals, delay]);

  useEffect(() => {
    if (startOnMount) {
      animate();
    }
  }, [animate, startOnMount]);

  return { animate, hasAnimated: hasAnimated.current };
}

// ============================================
// HERO ANIMATIONS HOOK
// ============================================

export function useHeroAnimations() {
  useEffect(() => {
    // Animate hero lines with stagger
    const lines = document.querySelectorAll('.hero-line');
    lines.forEach((line, index) => {
      const el = line as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + index * 300);
    });

    // Animate hero stats
    const stats = [
      { id: 'stat-claims', value: 14046, decimals: 0, suffix: '' },
      { id: 'stat-compensated', value: 42, decimals: 0, suffix: '' },
      { id: 'stat-cicp-rate', value: 0.3, decimals: 1, suffix: '%' },
      { id: 'stat-vicp-rate', value: 48, decimals: 0, suffix: '%', prefix: '~' },
    ];

    stats.forEach((stat, index) => {
      const element = document.getElementById(stat.id);
      if (!element) return;

      // Reset to 0
      element.textContent = (stat.prefix || '') + '0' + stat.suffix;

      // Animate with stagger
      setTimeout(() => {
        animateNumber(element, stat.value, 2000, {
          prefix: stat.prefix || '',
          suffix: stat.suffix,
          decimals: stat.decimals,
        });
      }, 1200 + index * 200);
    });
  }, []);
}

// ============================================
// SCROLL-TRIGGERED ANIMATIONS HOOK
// ============================================

export function useScrollAnimations() {
  useEffect(() => {
    // Outlier bars animation
    const outlierContainer = document.querySelector('.outlier-bar-container');
    if (outlierContainer) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const outlierBar = entry.target.querySelector('.outlier-portion') as HTMLElement;
              const othersBar = entry.target.querySelector('.others-portion') as HTMLElement;

              if (outlierBar && othersBar) {
                outlierBar.style.width = '0%';
                othersBar.style.width = '0%';
                outlierBar.style.transition = 'width 1s ease-out';
                othersBar.style.transition = 'width 1s ease-out 0.3s';

                setTimeout(() => {
                  outlierBar.style.width = '91%';
                  othersBar.style.width = '9%';
                }, 100);
              }

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(outlierContainer);
    }

    // Comparison bars animation
    const comparison = document.querySelector('.outlier-comparison, .payment-comparison');
    if (comparison) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cicpBar = entry.target.querySelector('.cicp-bar, [class*="cicp"]') as HTMLElement;
              const vicpBar = entry.target.querySelector('.vicp-bar, [class*="vicp"]') as HTMLElement;

              if (cicpBar) {
                const targetWidth = cicpBar.dataset.width || '1%';
                cicpBar.style.width = '0%';
                cicpBar.style.transition = 'width 0.8s ease-out';
                setTimeout(() => {
                  cicpBar.style.width = targetWidth;
                }, 300);
              }

              if (vicpBar) {
                const targetWidth = vicpBar.dataset.width || '100%';
                vicpBar.style.width = '0%';
                vicpBar.style.transition = 'width 1s ease-out';
                setTimeout(() => {
                  vicpBar.style.width = targetWidth;
                }, 600);
              }

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(comparison);
    }

    // Funnel bars animation
    const funnelBars = document.querySelectorAll('.funnel-stage .funnel-bar, .funnel-bar');
    if (funnelBars.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bar = entry.target as HTMLElement;
              const targetWidth = bar.dataset.width || bar.style.width || '100%';

              bar.dataset.width = targetWidth;
              bar.style.width = '0%';
              bar.style.transition = 'width 0.8s ease-out';

              setTimeout(() => {
                bar.style.width = targetWidth;
              }, 100);

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      funnelBars.forEach((bar) => {
        const el = bar as HTMLElement;
        if (!el.dataset.width) {
          el.dataset.width = el.style.width || '100%';
        }
        observer.observe(bar);
      });
    }
  }, []);
}

// ============================================
// FUNNEL INTERACTION HOOK
// ============================================

export function useFunnelInteraction() {
  useEffect(() => {
    const stages = document.querySelectorAll('.funnel-stage[data-stage]');

    // Set initial state for all details
    document.querySelectorAll('.funnel-detail').forEach((detail) => {
      const el = detail as HTMLElement;
      el.style.maxHeight = '0';
      el.style.opacity = '0';
      el.style.overflow = 'hidden';
      el.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
    });

    const handleClick = (e: Event) => {
      const stage = e.currentTarget as HTMLElement;
      const stageId = stage.dataset.stage;
      const detail = document.getElementById('detail-' + stageId);

      if (!detail) return;

      // Close all other details
      document.querySelectorAll('.funnel-detail').forEach((d) => {
        if (d !== detail) {
          d.classList.remove('show');
          (d as HTMLElement).style.maxHeight = '0';
          (d as HTMLElement).style.opacity = '0';
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
    };

    stages.forEach((stage) => {
      (stage as HTMLElement).style.cursor = 'pointer';
      stage.addEventListener('click', handleClick);
    });

    return () => {
      stages.forEach((stage) => {
        stage.removeEventListener('click', handleClick);
      });
    };
  }, []);
}

// ============================================
// TOAST HOOK
// ============================================

export function useToast() {
  const show = useCallback((message: string, duration: number = 3000) => {
    let toast = document.getElementById('toast');

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

    requestAnimationFrame(() => {
      toast!.style.transform = 'translateX(-50%) translateY(0)';
      toast!.style.opacity = '1';
    });

    setTimeout(() => {
      toast!.style.transform = 'translateX(-50%) translateY(100px)';
      toast!.style.opacity = '0';
    }, duration);
  }, []);

  return { show };
}

// ============================================
// ALL-IN-ONE HOOK
// ============================================

export function useSiteAnimations() {
  useHeroAnimations();
  useScrollAnimations();
  useFunnelInteraction();

  // Inject CSS
  useEffect(() => {
    const cssId = 'site-animations-css';
    if (document.getElementById(cssId)) return;

    const css = `
      .hero-line {
        opacity: 0;
        transform: translateY(30px);
      }
      
      .counting {
        animation: numberPulse 0.3s ease !important;
      }
      
      @keyframes numberPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      
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
      
      .outlier-portion,
      .others-portion,
      .cicp-bar,
      .vicp-bar,
      .funnel-bar {
        transition: width 0.8s ease-out;
      }
    `;

    const style = document.createElement('style');
    style.id = cssId;
    style.textContent = css;
    document.head.appendChild(style);
  }, []);
}

// ============================================
// UTILITY FUNCTION (non-hook)
// ============================================

function animateNumber(
  element: HTMLElement,
  target: number,
  duration: number,
  options: { prefix?: string; suffix?: string; decimals?: number } = {}
) {
  const { prefix = '', suffix = '', decimals = 0 } = options;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);

    let current: string;
    if (decimals > 0) {
      current = (target * easeOutQuart).toFixed(decimals);
    } else {
      current = Math.floor(target * easeOutQuart).toLocaleString();
    }

    element.textContent = prefix + current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.classList.add('counting');
      setTimeout(() => element.classList.remove('counting'), 300);
    }
  }

  requestAnimationFrame(update);
}

// Export for use outside React
export { animateNumber };
