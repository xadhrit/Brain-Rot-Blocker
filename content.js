// YouTube Brain Rot Blocker Content Script

(function() {
    'use strict';
    
    // Configuration
    const config = {
        blockShorts: true,
        blockSuggestions: true,
        hideInteractions: true,
        hideComments: true
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
        
        // Periodic cleanup
        setInterval(blockContent, 2000);
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
