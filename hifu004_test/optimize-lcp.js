// LCP Optimization Script
(function() {
    'use strict';
    
    // Preload and optimize hero image
    function optimizeHeroImage() {
        const heroImg = document.querySelector('.hero-image');
        if (!heroImg) return;
        
        // Add loaded class when image loads
        if (heroImg.complete) {
            heroImg.classList.add('loaded');
        } else {
            heroImg.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
        
        // Error handling
        heroImg.addEventListener('error', function() {
            console.error('Hero image failed to load');
            // Fallback to lower quality image if available
            if (this.src.includes('.webp')) {
                this.src = this.src.replace('.webp', '.jpg');
            }
        });
    }
    
    // Progressive image loading
    function progressiveImageLoading() {
        // Load low quality placeholder first
        const images = document.querySelectorAll('img[data-src]');
        
        images.forEach(img => {
            // Set low quality placeholder
            if (img.dataset.placeholder) {
                img.style.filter = 'blur(5px)';
                img.src = img.dataset.placeholder;
            }
            
            // Load full quality image
            const fullImg = new Image();
            fullImg.src = img.dataset.src;
            fullImg.onload = function() {
                img.src = this.src;
                img.style.filter = 'none';
                img.removeAttribute('data-src');
                img.removeAttribute('data-placeholder');
            };
        });
    }
    
    // Optimize font loading
    function optimizeFonts() {
        // Font face observer pattern
        if ('fonts' in document) {
            Promise.all([
                document.fonts.load('400 1em Noto Sans JP'),
                document.fonts.load('700 1em Noto Sans JP')
            ]).then(() => {
                document.documentElement.classList.add('fonts-loaded');
            }).catch(() => {
                // Fallback if fonts fail to load
                document.documentElement.classList.add('fonts-failed');
            });
        }
    }
    
    // Remove render-blocking resources
    function deferNonCriticalCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        
        stylesheets.forEach(link => {
            // Skip critical styles
            if (link.href.includes('styles.css')) return;
            
            // Convert to non-blocking
            if (!link.media || link.media === 'all') {
                link.media = 'print';
                link.onload = function() {
                    this.media = 'all';
                    this.onload = null;
                };
            }
        });
    }
    
    // Priority hints for resources
    function setPriorityHints() {
        // High priority for LCP image
        const lcpImage = document.querySelector('.hero-image');
        if (lcpImage) {
            lcpImage.fetchpriority = 'high';
            lcpImage.loading = 'eager';
        }
        
        // Low priority for below-fold images
        const belowFoldImages = document.querySelectorAll('.ranking-container img, .tips-section img');
        belowFoldImages.forEach(img => {
            img.loading = 'lazy';
            img.fetchpriority = 'low';
        });
    }
    
    // Resource timing optimization
    function optimizeResourceTiming() {
        // Check if Resource Timing API is available
        if (!window.performance || !window.performance.getEntriesByType) return;
        
        // Monitor slow resources
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(r => r.duration > 1000);
        
        if (slowResources.length > 0) {
            console.group('Slow resources detected:');
            slowResources.forEach(r => {
                console.log(`${r.name}: ${Math.round(r.duration)}ms`);
            });
            console.groupEnd();
        }
    }
    
    // Initialize optimizations
    function init() {
        // Run immediately
        optimizeHeroImage();
        setPriorityHints();
        deferNonCriticalCSS();
        
        // Run after DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                progressiveImageLoading();
                optimizeFonts();
            });
        } else {
            progressiveImageLoading();
            optimizeFonts();
        }
        
        // Run after page load
        window.addEventListener('load', () => {
            optimizeResourceTiming();
        });
    }
    
    // Start optimizations
    init();
})();