/**
 * HSBC 8012 standalone demo Authentication Guard
 * This script keeps the 8012 demo auth state separate from the :80 POC site.
 */

(function() {
    'use strict';
    
    // Configuration
    const AUTH_KEY = 'hsbc_avoid_auth';
    const USER_KEY = 'hsbc_avoid_user';
    const ACTIVITY_KEY = 'hsbc_avoid_last_activity';
    const AUTH_COOKIE = 'auth_token_avoid';
    const LOGIN_PAGE = '/login.html';
    
    // Check if current page is the login page
    function isLoginPage() {
        return window.location.pathname.endsWith('/login.html') || 
               window.location.pathname.endsWith('/login');
    }
    
    // Utility function to get cookie value
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Check if user is authenticated
    function isAuthenticated() {
        // First check sessionStorage
        if (sessionStorage.getItem(AUTH_KEY) === 'authenticated') {
            return true;
        }
        
        // If not in sessionStorage, check for HTTP cookie
        const authCookie = getCookie(AUTH_COOKIE);
        if (authCookie && authCookie.startsWith('authenticated_')) {
            // Sync the auth state to sessionStorage
            sessionStorage.setItem(AUTH_KEY, 'authenticated');
            const username = authCookie.replace('authenticated_', '');
            sessionStorage.setItem(USER_KEY, username);
            return true;
        }
        
        return false;
    }
    
    // Get current user
    function getCurrentUser() {
        return sessionStorage.getItem(USER_KEY);
    }
    
    // Redirect to login page
    function redirectToLogin() {
        window.location.href = LOGIN_PAGE;
    }
    
    // Redirect to main page
    function redirectToMain() {
        window.location.href = '/';
    }
    
    // Logout function
    function logout() {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(USER_KEY);
        
        // Also clear the HTTP cookie by calling the logout API
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            redirectToLogin();
        }).catch(() => {
            // Even if the API call fails, still redirect to login
            redirectToLogin();
        });
    }
    
    // Add logout functionality to any logout links
    function setupLogoutLinks() {
        const logoutLinks = document.querySelectorAll('[data-logout], .logout-button, .cpi-masthead-logoff__button-dpws');
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        });
    }
    
    // Update login/logout UI
    function updateAuthUI() {
        const user = getCurrentUser();
        if (user && isAuthenticated()) {
            // Show logout elements
            const loginButtons = document.querySelectorAll('.login-button');
            const logoutButtons = document.querySelectorAll('.logout-button');
            
            loginButtons.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
            
            logoutButtons.forEach(btn => {
                if (btn) {
                    btn.style.display = 'block';
                    btn.classList.remove('hidden');
                }
            });
            
            // Update user info if any elements exist
            const userElements = document.querySelectorAll('[data-user-name]');
            userElements.forEach(el => {
                el.textContent = user;
            });
        }
    }
    
    // Session timeout check (optional - 30 minutes)
    function checkSessionTimeout() {
        const lastActivity = sessionStorage.getItem(ACTIVITY_KEY);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        if (lastActivity && (now - parseInt(lastActivity)) > thirtyMinutes) {
            logout();
        } else {
            sessionStorage.setItem(ACTIVITY_KEY, now.toString());
        }
    }
    
    // Track user activity for session timeout
    function trackActivity() {
        sessionStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }
    
    // Main authentication check
    function checkAuthentication() {
        if (isLoginPage()) {
            // If on login page and already authenticated, redirect to main
            if (isAuthenticated()) {
                redirectToMain();
            }
        } else {
            // If not on login page and not authenticated, redirect to login
            if (!isAuthenticated()) {
                redirectToLogin();
            } else {
                // Check session timeout
                checkSessionTimeout();
                // Update UI
                updateAuthUI();
                // Setup logout functionality
                setupLogoutLinks();
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuthentication);
    } else {
        checkAuthentication();
    }
    
    // Track activity for session timeout
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, trackActivity, { passive: true });
    });
    
    // Export functions for global use
    window.HSBCAuth = {
        isAuthenticated,
        getCurrentUser,
        logout,
        checkAuthentication
    };
})();
