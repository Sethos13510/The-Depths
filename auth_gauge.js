/**
 * auth_gauge.js
 * Manages the authentication gauge that tracks donation progress
 */

(function() {
    console.log(" Initialisation de la jauge d'authentification");
    
    // Configuration constants - only set if not already defined
    if (typeof window.REQUIRED_AMOUNT === 'undefined') {
        window.REQUIRED_AMOUNT = 10; // Default amount required in euros
    }
    
    if (typeof window.CURRENT_AMOUNT === 'undefined') {
        window.CURRENT_AMOUNT = 0;   // Default starting amount
    }
    
    // DOM elements
    let fillElement = document.getElementById('auth-donation-fill');
    let percentElement = document.getElementById('auth-donation-percent');
    
    // Check if required elements exist
    if (fillElement) {
        console.log(" Élément 'auth-donation-fill' trouvé");
    }
    
    if (percentElement) {
        console.log(" Élément 'auth-donation-percent' trouvé");
    }
    
    /**
     * Updates the authentication gauge UI based on current progress
     * @param {number} current - Current amount
     * @param {number} required - Required amount
     */
    if (typeof window.updateAuthGauge === 'undefined') {
        window.updateAuthGauge = function(current, required) {
            if (!fillElement) {
                fillElement = document.getElementById('auth-donation-fill');
            }
            
            if (!percentElement) {
                percentElement = document.getElementById('auth-donation-percent');
            }
            
            // Update global variables
            window.CURRENT_AMOUNT = current;
            window.REQUIRED_AMOUNT = required;
            
            // Calculate percentage with safety bounds
            const percentage = Math.min(Math.max((current / required) * 100, 0), 100);
            
            // Update fill element if it exists
            if (fillElement) {
                fillElement.style.width = percentage + "%";
            }
            
            // Update percentage text if element exists
            if (percentElement) {
                percentElement.textContent = Math.round(percentage) + "%";
            }
            
            // If authentication is complete (100%), unlock access
            if (percentage >= 100) {
                console.log(" Authentification réussie, accès débloqué");
                // Any additional unlock actions can go here
            }
        };
    }
    
    // Initialize gauge when DOM is loaded - only set up event listener if not already
    if (!window._authGaugeInitialized) {
        document.addEventListener('DOMContentLoaded', function() {
            // Initial update with default values
            window.updateAuthGauge(window.CURRENT_AMOUNT, window.REQUIRED_AMOUNT);
            
            // Set up Socket.IO event listeners for updates
            if (window.socketIO) {
                window.socketIO.on('auth_progress_update', function(data) {
                    if (data && typeof data.current === 'number' && typeof data.required === 'number') {
                        window.updateAuthGauge(data.current, data.required);
                    }
                });
            }
        });
        
        window._authGaugeInitialized = true;
    }
})(); 