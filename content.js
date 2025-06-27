// YouTube Brain Rot Blocker Content Script

(function () {
    'use strict';

    // Configuration
    const config = {
        blockShorts: true,
        blockSuggestions: true,
        hideInteractions: true,
        hideComments: true,
        blockAds: true
    };

    // Selectors for different elements to block
    const selectors = {
        shorts: [
            'ytd-shorts',
            'ytd-rich-shelf-renderer[is-shorts]',
            'ytd-reel-shelf-renderer',
            '[is-shorts]',
            'ytd-video-renderer[is-shorts]',
            '.ytd-shorts',
            '#shorts-container',
            'ytd-mini-game-card-renderer',
            'ytd-shorts-lockup-view-model',
            'ytd-reel-video-renderer',
            'ytd-shorts-player',
            '.shorts-player',
            'a[href*="/shorts/"]'
        ],
        suggestions: [
            'ytd-browse[page-subtype="home"] #contents',
            'ytd-rich-grid-renderer',
            'ytd-rich-section-renderer',
            '#secondary',
            '#related',
            '.ytd-watch-next-secondary-results-renderer',
            'ytd-compact-video-renderer',
            'ytd-shelf-renderer'
        ],
        interactions: [
            '#subscribe-button',
            'ytd-subscribe-button-renderer',
            '#actions #top-level-buttons-computed',
            'ytd-menu-renderer #button',
            'ytd-toggle-button-renderer',
            '#actions-inner',
            'ytd-sentiment-bar-renderer'
        ],
        comments: [
            '#comments',
            'ytd-comments',
            'ytd-comments-header-renderer',
            'ytd-comment-thread-renderer'
        ],
        endScreens: [
            '.ytp-ce-element',
            '.ytp-cards-teaser',
            '.ytp-endscreen-element',
            '.ytp-pause-overlay'
        ],
        ads: [
            // video ads
            '.video-ads',
            '.ytp-ad-module',
            '.ytp-ad-overlay-container',
            '.ytp-ad-text-overlay',
            '.ytp-ad-player-overlay',
            '.ytp-ad-image-overlay',
            '.ytp-ad-preview-container',
            '.ytp-ad-skip-button-container',
            '.ad-container',
            '.ad-div',

            // Promoted content
            'ytd-promoted-sparkles-text-search-renderer',
            'ytd-search-pyv-renderer',
            'ytd-promoted-video-renderer',
            'ytd-compact-promoted-video-renderer',
            'ytd-promoted-sparkles-web-renderer',

            // Banner ads
            '#masthead-ad',
            '.masthead-ad',
            '#player-ads',
            '.player-ads',
            'ytd-display-ad-renderer',
            'ytd-companion-slot-renderer',
            'ytd-action-companion-ad-renderer',
            '.GoogleActiveViewElement',
            '#google_companion_ad_div',
            '#watch-sidebar-ad',

            // Feed ads
            'ytd-ad-slot-renderer',
            'ytd-in-feed-ad-layout-renderer',
            '.ad-slot-renderer',

            // Premium/shopping ads
            'ytd-popup-container',
            'tp-yt-paper-dialog',
            'ytd-mealbar-promo-renderer',
            'ytd-premium-promo-renderer',
            'ytd-shopping-carousel-renderer',
            'ytd-brand-video-shelf-renderer',

            // Ad indicators
            '.ytp-ad-duration-remaining',
            '.ytp-flyout-cta',
            '.ytp-suggested-action-badge',
            '.annotation'
        ]
    };


    // Function to hide elements
    function hideElements(selectorArray) {
        selectorArray.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.height = '0';
                        el.style.width = '0';
                        el.style.overflow = 'hidden';
                        el.remove();
                    }
                });
            } catch (e) {
                // Silently handle invalid selectors
            }
        });
    }

    // function to block ad scripts 
    function blockAds() {
        // block by selectors
        hideElements(selectors.ads);

        const sponsoredElements = document.querySelectorAll('span, div,p');
        sponsoredElements.forEach(el => {
            const text = el.textContent || el.innerText || '';
            if (text.includes('Sponsored') || text.includes('Ad •') || text.includes('Promoted')) {
                const container = el.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer, ytd-promoted-sparkles-text-search-renderer');
                if (container) {
                    container.remove();
                }
            }
        });

        // block video ads by checking hte video player
        const videoPlayer = document.querySelector('video');
        if (videoPlayer) {
            const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
            if (skipButton) {
                skipButton.click();
            }

            // Block ad overlay
            const adOverlay = document.querySelector('.ytp-ad-overlay-container');
            if (adOverlay) {
                adOverlay.remove();
            }
        }

        // Block ads by checking for ad URLs
        const iframes = document.querySelectorAll('iframe[src*="doubleclick"], iframe[src*="googleads"], iframe[src*="googlesyndication"]');
        iframes.forEach(iframe => iframe.remove());

        // Block ads by checking for ad-related attributes
        const adElements = document.querySelectorAll('[id*="ad"], [class*="ad"], [data-ad-slot], [data-google-query-id]');
        adElements.forEach(el => {
            const id = el.id || '';
            const className = el.className || '';
            if (id.includes('ad') || className.includes('ad') || className.includes('google') || className.includes('doubleclick')) {
                // Don't remove essential elements
                if (!id.includes('header') && !id.includes('nav') && !className.includes('header') && !className.includes('nav')) {
                    el.remove();
                }
            }
        });

        // Block premium promotion popups
        const popups = document.querySelectorAll('ytd-popup-container, tp-yt-paper-dialog');
        popups.forEach(popup => {
            if (popup.textContent.includes('Premium') || popup.textContent.includes('ad-free')) {
                popup.remove();
            }
        });
    }

    // advanced ad blocking with video monitoring
    function setupVideoAdBlocking() {
        const video = document.querySelector('video');
        if (!video) return;

        // monitor for ad indicator
        const observer = new MutationObserver(() => {
            // auto skip ads
            const skipbtn = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
            if (skipbtn && skipbtn.offsetParent !== null) {
                setTimeout(() => skipbtn.click(), 100);
            }

            // remove ad containers
            const adContainers = document.querySelectorAll('.ytp-ad-module, .ytp-ad-overlay-container');
            adContainers.forEach(container => container.remove());

        });

        observer.observe(video.parentElement, {
            childList: true,
            subtree: true
        });

        // speed up ads 
        video.addEventListener('loadstart', () => {
            const adIndicator = document.querySelector('.ytp-ad-text, .ytp-ad-duration-remaining');
            if (adIndicator) {
                video.playbackRate = 16; // Speed up ad
                video.muted = true;
            }
        });

        // reset speed after ad
        video.addEventListener('ended', () => {
            setTimeout(() => {
                if (!document.querySelector('.ytp-ad-text')) {
                    video.playbackRate = 1;
                    video.muted = false;
                }
            }, 1000);
        });
    }


    // Function to block content based on URL patterns
    function blockShortsInURL() {
        const links = document.querySelectorAll('a[href*="/shorts/"]');
        links.forEach(link => {
            const container = link.closest('ytd-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer');
            if (container) {
                container.remove();
            } else {
                link.remove();
            }
        });
    }

    // Main blocking function
    function blockContent() {
        if (config.blockShorts) {
            hideElements(selectors.shorts);
            blockShortsInURL();
        }

        if (config.blockSuggestions) {
            hideElements(selectors.suggestions);
        }

        if (config.hideInteractions) {
            hideElements(selectors.interactions);
        }

        if (config.hideComments) {
            hideElements(selectors.comments);
        }
        if (config.blockAds){
            blockAds();
        }

        hideElements(selectors.endScreens);
    }

    // Observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        let shouldBlock = false;

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        shouldBlock = true;
                        break;
                    }
                }
            }
        });

        if (shouldBlock) {
            setTimeout(blockContent, 100);
        }
    });

    // Start observing
    function startObserver() {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }

    // Handle navigation changes (for SPAs like YouTube)
    function handleNavigation() {
        // Block content on URL changes
        let currentURL = window.location.href;

        const checkURLChange = () => {
            if (currentURL !== window.location.href) {
                currentURL = window.location.href;
                setTimeout(blockContent, 500);
            }
        };

        // Check for URL changes every 500ms
        setInterval(checkURLChange, 500);
    }

    // Initialize when DOM is ready
    function initialize() {
        // Initial block
        blockContent();

        // Start observing for new content
        startObserver();

        // Handle navigation
        handleNavigation();

        // setup video ad blocking
        setupVideoAdBlocking(); 

        // Periodic cleanup
        setInterval(blockContent, 2000);

        // extra aggressive ad blocking check
        setInterval(() => {
            if (config.blockAds){
                blockAds();
            }
        }, 1000);
    }

    // Start when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also run immediately for early blocking
    setTimeout(blockContent, 100);

    console.log('YouTube Brain Rot Blocker: Extension loaded');
})();
