// ChemBuddy - Hash-based SPA Router

const Router = (function () {
    'use strict';

    const routes = {};
    let currentRoute = null;
    let currentCleanup = null;

    function register(path, handler) {
        routes[path] = handler;
    }

    function navigate(hash) {
        window.location.hash = hash;
    }

    function handleRoute() {
        var hash = window.location.hash.slice(1) || '/home';
        var parts = hash.split('/').filter(Boolean);
        var matched = null;
        var params = {};

        // Try exact match first
        if (routes[hash]) {
            matched = routes[hash];
        } else {
            // Try pattern matching (e.g. /learn/:dayId, /browse/:equipId, /quiz/:quizId)
            for (var pattern in routes) {
                var patternParts = pattern.split('/').filter(Boolean);
                if (patternParts.length !== parts.length) continue;

                var isMatch = true;
                var tempParams = {};
                for (var i = 0; i < patternParts.length; i++) {
                    if (patternParts[i].startsWith(':')) {
                        tempParams[patternParts[i].slice(1)] = parts[i];
                    } else if (patternParts[i] !== parts[i]) {
                        isMatch = false;
                        break;
                    }
                }
                if (isMatch) {
                    matched = routes[pattern];
                    params = tempParams;
                    break;
                }
            }
        }

        if (!matched) {
            // Default to home
            matched = routes['/home'];
            params = {};
        }

        // Cleanup previous route
        if (currentCleanup && typeof currentCleanup === 'function') {
            currentCleanup();
            currentCleanup = null;
        }

        currentRoute = hash;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === '#' + hash || (href && hash.startsWith(href.slice(1)))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Call route handler
        var container = document.getElementById('app-content');
        if (container && matched) {
            var result = matched(container, params);
            if (typeof result === 'function') {
                currentCleanup = result;
            }
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    function init() {
        window.addEventListener('hashchange', handleRoute);
        // Initial route
        handleRoute();
    }

    function getCurrentRoute() {
        return currentRoute;
    }

    return {
        register: register,
        navigate: navigate,
        init: init,
        getCurrentRoute: getCurrentRoute
    };
})();
