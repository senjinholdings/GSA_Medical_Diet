// Performance Optimization Script
(function() {
    'use strict';
    
    // Defer non-critical scripts
    function deferNonCriticalScripts() {
        // List of scripts to defer
        const deferredScripts = [
            '/url-tracking.js?v=2025072201',
            '/tracking-params.js'
        ];
        
        // Load scripts after user interaction or timeout
        let scriptsLoaded = false;
        
        function loadDeferredScripts() {
            if (scriptsLoaded) return;
            scriptsLoaded = true;
            
            deferredScripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.defer = true;
                document.body.appendChild(script);
            });
        }
        
        // Load after 3 seconds or on first user interaction
        setTimeout(loadDeferredScripts, 3000);
        ['mousedown', 'touchstart', 'scroll'].forEach(event => {
            window.addEventListener(event, loadDeferredScripts, { once: true, passive: true });
        });
    }
    
    // Optimize image loading with progressive enhancement
    function optimizeImageLoading() {
        // Get all images
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Skip hero image
            if (img.classList.contains('hero-image')) return;
            
            // Add loading lazy if not set
            if (!img.hasAttribute('loading')) {
                img.loading = 'lazy';
            }
            
            // Add decoding async if not set
            if (!img.hasAttribute('decoding')) {
                img.decoding = 'async';
            }
        });
    }
    
    // Optimize web font loading
    function optimizeFontLoading() {
        // Use font-display: swap for better performance
        const fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
        if (fontLink) {
            const href = fontLink.href;
            if (!href.includes('display=')) {
                fontLink.href = href + '&display=swap';
            }
        }
    }
    
    // Request idle callback for non-critical operations
    function scheduleNonCriticalWork() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Preload next images
                const nextImages = [
                    'images/Tips1.webp',
                    'images/Tips2.webp',
                    'images/Tips3.webp'
                ];
                
                nextImages.forEach(src => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.as = 'image';
                    link.href = src;
                    document.head.appendChild(link);
                });
            }, { timeout: 2000 });
        }
    }
    
    // Optimize jQuery execution
    function optimizeJQuery() {
        // Wait for jQuery to load
        const checkJQuery = setInterval(() => {
            if (typeof jQuery !== 'undefined') {
                clearInterval(checkJQuery);
                
                // Defer non-critical jQuery operations
                jQuery(document).ready(function($) {
                    // Use requestAnimationFrame for smooth animations
                    if ($.fn.animate) {
                        const originalAnimate = $.fn.animate;
                        $.fn.animate = function() {
                            const args = arguments;
                            const $this = this;
                            requestAnimationFrame(() => {
                                originalAnimate.apply($this, args);
                            });
                            return this;
                        };
                    }
                });
            }
        }, 100);
    }
    
    // Initialize optimizations
    function init() {
        // Run immediate optimizations
        optimizeImageLoading();
        optimizeFontLoading();
        
        // Defer non-critical work
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                deferNonCriticalScripts();
                scheduleNonCriticalWork();
                optimizeJQuery();
            });
        } else {
            deferNonCriticalScripts();
            scheduleNonCriticalWork();
            optimizeJQuery();
        }
    }
    
    // Start optimization
    init();
})();