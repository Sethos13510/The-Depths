/**
 * Module principal d'initialisation
 * Ce fichier coordonne l'initialisation de tous les autres modules
 */

// Variables globales
let debug = false;

/**
 * Initialisation principale de l'application
 */
function initializeApp() {
    // VÃƒÆ’Ã‚Â©rifier si le mode debug est activÃƒÆ’Ã‚Â©
    debug = window.location.search.includes('debug=true');
    
    // Initialiser les variables globales
    window.totalDonations = 0;
    window.recentDonationAmount = 0;
    window.currentMilestoneIndex = 0;
    window.storyProgress = 0;
    window.storyHistory = [];
    window.leaderboard = [];
    
    // Initialiser l'interface utilisateur
    initializeUI();
    
    // Initialiser l'ÃƒÆ’Ã‚Â©cran de chargement
    updateDonationProgress(0);
    
    // Configurer les ÃƒÆ’Ã‚Â©couteurs d'ÃƒÆ’Ã‚Â©vÃƒÆ’Ã‚Â©nements
    setupEventListeners();
    
    // Configurer le mode debug si activÃƒÆ’Ã‚Â©
    if (debug) {
        setupDebugMode();
    }
    
    // VÃƒÆ’Ã‚Â©rifier si des dons sont en attente de traitement
    setTimeout(checkExternalDonations, 2000);
}

/**
 * Configuration des ÃƒÆ’Ã‚Â©couteurs d'ÃƒÆ’Ã‚Â©vÃƒÆ’Ã‚Â©nements
 */
function setupEventListeners() {
    // ÃƒÆ’Ã¢â‚¬Â°couter les messages provenant d'autres fenÃƒÆ’Ã‚Âªtres (simulateur)
    window.addEventListener('message', function(event) {
        // VÃƒÆ’Ã‚Â©rifier que le message vient d'une source fiable
        if (event.data && event.data.type) {
            // Traiter la rÃƒÆ’Ã‚Â©initialisation des dons
            if (event.data.type === 'resetDonations') {
                resetDonations();
            }
            
            // Traiter les donations
            if (event.data.type === 'donation' && event.data.data) {
                const { username, amount } = event.data.data;
                if (username && amount) {
                    simulateDonation(username, amount);
                }
            }
        }
    });
    
    // Ajouter un gestionnaire pour le bouton dÃƒÆ’Ã‚Â©tails d'exploration
    const detailsButton = document.getElementById('details-button');
    if (detailsButton) {
        detailsButton.addEventListener('click', function() {
            window.open('exploration_details.html', '_blank');
        });
    }
}

/**
 * Configuration du mode debug
 */
function setupDebugMode() {
    const debugPanel = document.getElementById('debug');
    if (debugPanel) {
        debugPanel.style.display = 'block';
        
        // Bouton pour simuler un cadeau
        const giftBtn = document.getElementById('giftBtn');
        if (giftBtn) {
            giftBtn.addEventListener('click', () => {
                simulateDonation("TestUser", 5, "Cadeau");
            });
        }
        
        // Bouton pour simuler un don
        const donateBtn = document.getElementById('donateBtn');
        if (donateBtn) {
            donateBtn.addEventListener('click', () => {
                simulateDonation("TestUser", 20, "Don");
            });
        }
        
        // Bouton pour dÃƒÆ’Ã‚Â©clencher un ÃƒÆ’Ã‚Â©vÃƒÆ’Ã‚Â©nement spÃƒÆ’Ã‚Â©cial
        const eventBtn = document.getElementById('eventBtn');
        if (eventBtn) {
            eventBtn.addEventListener('click', () => {
                triggerSpecialEvent();
            });
        }
        
        // Bouton pour rÃƒÆ’Ã‚Â©vÃƒÆ’Ã‚Â©ler un indice
        const clueBtn = document.getElementById('clueBtn');
        if (clueBtn) {
            clueBtn.addEventListener('click', () => {
                revealRandomClue();
            });
        }
        
        // Logger des informations pour le dÃƒÆ’Ã‚Â©bogage
        console.log("Mode debug activÃƒÆ’Ã‚Â©");
        console.log("Variables globales :", {
            totalDonations: window.totalDonations,
            currentMilestoneIndex: window.currentMilestoneIndex,
            storyProgress: window.storyProgress
        });
    }
}

/**
 * Initialisation aprÃƒÆ’Ã‚Â¨s l'authentification
 */
function initializeAfterAuth() {
    // Mettre ÃƒÆ’Ã‚Â  jour le statut du systÃƒÆ’Ã‚Â¨me
    const statusLight = document.getElementById('status-light');
    const statusText = document.getElementById('status-text');
    
    if (statusLight) {
        statusLight.style.backgroundColor = '#55ff55';
        statusLight.style.boxShadow = '0 0 10px #55ff55';
    }
    
    if (statusText) {
        statusText.textContent = 'SYSTÃƒÆ’Ã‹â€ ME EN LIGNE';
    }
    
    // Initialiser l'historique
    initializeHistory();
    
    // Afficher les panneaux d'historique et de classement
    const storyHistoryPanel = document.getElementById('story-history-panel');
    const leaderboardPanel = document.getElementById('leaderboard-panel');
    
    if (storyHistoryPanel) storyHistoryPanel.style.display = 'block';
    if (leaderboardPanel) leaderboardPanel.style.display = 'block';
}

/**
 * Initialisation de l'historique
 */
function initializeHistory() {
    // Ajouter quelques entrÃƒÆ’Ã‚Â©es initiales dans l'historique si vide
    if (!window.storyHistory || window.storyHistory.length === 0) {
        addToStoryHistory('milestone', 'Bienvenue dans Les Profondeurs');
        addToStoryHistory('discovery', 'Explorez le terminal ÃƒÆ’Ã‚Â  la recherche d\'indices');
        addToStoryHistory('event', 'Attention aux entitÃƒÆ’Ã‚Â©s mystÃƒÆ’Ã‚Â©rieuses');
    }
}

// Initialiser l'application au chargement du document
document.addEventListener('DOMContentLoaded', initializeApp); 