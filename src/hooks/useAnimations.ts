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

    // Outlier stacked bar animation - CSS class based for smooth linear fill
    const stackedBar = document.querySelector('.outlier-stacked-bar');
    if (stackedBar) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const singleSegment = entry.target.querySelector('.outlier-segment.single');
              const othersSegment = entry.target.querySelector('.outlier-segment.others');

              // Add animated class after a small delay to trigger CSS transition
              setTimeout(() => {
                if (singleSegment) singleSegment.classList.add('animated');
              }, 100);

              setTimeout(() => {
                if (othersSegment) othersSegment.classList.add('animated');
              }, 600);

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(stackedBar);
    }

    // Median comparison bars animation - CSS class based for smooth linear fill
    const medianComparison = document.querySelector('.median-comparison');
    if (medianComparison) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cicpBar = entry.target.querySelector('.median-bar-fill.cicp');
              const vicpBar = entry.target.querySelector('.median-bar-fill.vicp');

              // Add animated class after a small delay to trigger CSS transition
              setTimeout(() => {
                if (cicpBar) cicpBar.classList.add('animated');
              }, 100);

              setTimeout(() => {
                if (vicpBar) vicpBar.classList.add('animated');
              }, 300);

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(medianComparison);
    }

    // Waterfall funnel bars animation - handled by CSS in page.tsx via funnelAnimated state
    // The CSS clip-path animation triggers when .animate class is added to .waterfall-funnel

    // Comparison cards animation
    const comparisonCards = document.querySelectorAll('.comparison-card');
    if (comparisonCards.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const card = entry.target as HTMLElement;
              card.style.opacity = '0';
              card.style.transform = 'translateY(30px)';
              card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 100);

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      comparisonCards.forEach((card, index) => {
        const el = card as HTMLElement;
        el.style.opacity = '0';
        setTimeout(() => {
          observer.observe(card);
        }, index * 150);
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
// SECTION FADE-IN ON SCROLL HOOK
// ============================================

export function useSectionFadeIn() {
  useEffect(() => {
    const sections = document.querySelectorAll(
      '.funnel-section, .comparison-section, .outlier-section, .calculator-section, .trustfund-section, .action-section, .faq-preview-section, .personal-calculator-section'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-section', 'visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    sections.forEach((section) => {
      section.classList.add('fade-in-section');
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
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
// PARALLAX HERO HOOK
// ============================================

export function useParallaxHero() {
  useEffect(() => {
    const hero = document.querySelector('.hero') as HTMLElement;
    if (!hero) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;

      // Only apply parallax while hero is visible
      if (scrollY < heroHeight) {
        const parallaxOffset = scrollY * 0.3;
        hero.style.backgroundPositionY = `${parallaxOffset}px`;

        // Subtle opacity fade for hero content
        const heroInner = hero.querySelector('.hero-inner') as HTMLElement;
        if (heroInner) {
          const opacity = Math.max(0, 1 - (scrollY / heroHeight) * 0.5);
          heroInner.style.opacity = String(opacity);
          heroInner.style.transform = `translateY(${scrollY * 0.1}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// ============================================
// ALL-IN-ONE HOOK
// ============================================

export function useSiteAnimations() {
  useHeroAnimations();
  useScrollAnimations();
  useFunnelInteraction();
  useSectionFadeIn();
  useParallaxHero();

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

      .comparison-card,
      .stat-card {
        transition: opacity 0.6s ease, transform 0.6s ease;
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
