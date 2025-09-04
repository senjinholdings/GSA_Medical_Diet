// Lazy Loading Implementation for Images
(function() {
    'use strict';
    
    // Image lazy loading with Intersection Observer
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Set src from data-src if exists
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Set srcset from data-srcset if exists
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    // Remove lazy loading attribute
                    img.removeAttribute('loading');
                    
                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            // Start loading images 200px before they enter viewport
            rootMargin: '200px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support Intersection Observer
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });
    }
    
    // Preload critical resources
    function preloadCriticalResources() {
        // Preload next section images
        const criticalImages = [
            'images/ranking_header_banner.webp',
            'images/Tips1.webp'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
    
    // Start preloading after main content loads
    if (document.readyState === 'complete') {
        setTimeout(preloadCriticalResources, 1000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(preloadCriticalResources, 1000);
        });
    }
    
    // Resource hints for third-party domains
    function addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
            { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];
        
        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossorigin) {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }
    
    // Add resource hints immediately
    addResourceHints();
})();