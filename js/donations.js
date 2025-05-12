/**
 * Module de gestion des dons et de progression du jeu
 */

// Configuration
const DONATION_THRESHOLD = 10; // Montant requis pour débloquer l'accès

// Variables globales
let totalDonations = 0;
let recentDonationAmount = 0;
let currentMilestoneIndex = 0;
let leaderboard = [];

// Structure des niveaux de donateurs
const DONOR_TIERS = [
    { min: 0, max: 9.99, name: 'Explorateur', class: 'donor-bronze' },
    { min: 10, max: 49.99, name: 'Navigateur', class: 'donor-silver' },
    { min: 50, max: 99.99, name: 'Découvreur', class: 'donor-gold' },
    { min: 100, max: 199.99, name: 'Pionnier', class: 'donor-platinum' },
    { min: 200, max: Infinity, name: 'Maître Explorateur', class: 'donor-diamond' }
];

/**
 * Mise à jour de la barre de progression des dons
 * @param {number} amount - Montant total des dons
 */
function updateDonationProgress(amount) {
    const fillBar = document.getElementById('donation-fill');
    const percentText = document.getElementById('donation-percent');
    const currentAmount = document.getElementById('current-donation');
    
    if (fillBar && percentText && currentAmount) {
        const percentage = Math.min((amount / DONATION_THRESHOLD) * 100, 100);
        fillBar.style.width = percentage + '%';
        percentText.textContent = Math.floor(percentage) + '%';
        currentAmount.textContent = amount.toFixed(2) + '€';
    }
}

/**
 * Simulation d'un don
 * @param {string} username - Nom du donateur
 * @param {number} amount - Montant du don
 * @param {string} source - Source du don
 */
function simulateDonation(username, amount, source = "Don") {
    // Condition d'arrêt : authentification déjà complète
    if (window.CURRENT_AMOUNT >= window.REQUIRED_AMOUNT) {
        console.log("✅ Authentification déjà complète, don ignoré.");
        return;
    }
    // Mettre à jour le total des dons
    totalDonations += amount;
    
    // Mettre à jour la jauge d'authentification si la fonction est disponible
    if (window.updateAuthGauge) {
        window.updateAuthGauge(amount);
    }
    
    // Mettre à jour la barre de progression
    updateDonationProgress(totalDonations);
}

/**
 * Mise à jour de l'affichage des dons
 */
function updateDonationDisplay() {
    const totalDonationsEl = document.getElementById('total-donations');
    if (totalDonationsEl) {
        totalDonationsEl.textContent = totalDonations.toFixed(2) + ' €';
    }
    
    // Calculer le pourcentage de progression jusqu'au prochain palier
    const nextMilestone = null; // Référence aux STORY_MILESTONES supprimée
    
    if (nextMilestone) {
        const progress = Math.min(100, (totalDonations / nextMilestone.amount) * 100);
        const progressBar = document.getElementById('story-progress');
        const progressPercent = document.getElementById('progress-percent');
        const nextMilestoneAmountEl = document.getElementById('next-milestone-amount');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressPercent) progressPercent.textContent = Math.floor(progress) + '%';
        if (nextMilestoneAmountEl) nextMilestoneAmountEl.textContent = nextMilestone.amount + ' €';
        
        // Mettre à jour la variable de progression globale
        window.storyProgress = progress / 100;
    }
}

/**
 * Mise à jour du classement des donateurs
 * @param {string} username - Nom du donateur
 * @param {number} amount - Montant du don
 */
function updateLeaderboard(username, amount) {
    // Rechercher si l'utilisateur existe déjà dans le classement
    const existingUserIndex = leaderboard.findIndex(entry => entry.username === username);
    
    if (existingUserIndex >= 0) {
        // Mettre à jour le montant existant
        leaderboard[existingUserIndex].amount += amount;
    } else {
        // Ajouter un nouvel utilisateur
        leaderboard.push({ username, amount });
    }
    
    // Trier le classement par montant
    leaderboard.sort((a, b) => b.amount - a.amount);
    
    // Limiter à 10 entrées
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }
    
    // Mettre à jour l'affichage
    renderLeaderboard();
}

/**
 * Affichage du classement
 */
function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;
    
    leaderboardList.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        // Déterminer le niveau du donateur
        let donorTier = DONOR_TIERS.find(tier => 
            entry.amount >= tier.min && entry.amount <= tier.max
        ) || DONOR_TIERS[0];
        
        item.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span class="username ${donorTier.class}">${entry.username}</span>
            <span class="amount">${entry.amount.toFixed(2)}€</span>
        `;
        
        leaderboardList.appendChild(item);
    });
}

/**
 * Réinitialisation des dons
 */
function resetDonations() {
    // Réinitialiser les variables de dons
    totalDonations = 0;
    recentDonationAmount = 0;
    currentMilestoneIndex = 0;
    
    // Réinitialiser le leaderboard
    leaderboard = [];
    
    // Réinitialiser l'affichage
    updateDonationDisplay();
    renderLeaderboard();
    updateDonationProgress(0);
    
    // Afficher l'overlay d'authentification
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) {
        authOverlay.style.opacity = '1';
        authOverlay.style.display = 'block';
    }
    
    // Réinitialiser la jauge d'authentification
    const percent = document.getElementById('auth-donation-percent');
    const fill = document.getElementById('auth-donation-fill');
    if (percent) percent.textContent = '0%';
    if (fill) fill.style.width = '0%';
    const authButton = document.getElementById('auth-accept');
    if (authButton) {
        authButton.disabled = true;
        authButton.style.opacity = '0.6';
        authButton.style.cursor = 'not-allowed';
    }
    
    // Mettre à jour le statut du système
    const statusLight = document.getElementById('status-light');
    const statusText = document.getElementById('status-text');
    
    if (statusLight) {
        statusLight.style.backgroundColor = '#ff5555';
        statusLight.style.boxShadow = '0 0 10px #ff5555';
    }
    
    if (statusText) {
        statusText.textContent = 'SYSTÈME RÉINITIALISÉ';
    }
    
    // Réinitialiser la barre de progression
    const storyProgress = document.getElementById('story-progress');
    if (storyProgress) {
        storyProgress.style.width = '0%';
    }
    
    const progressPercent = document.getElementById('progress-percent');
    if (progressPercent) {
        progressPercent.textContent = '0%';
    }
    
    // Notifier dans le journal
    addToStoryHistory('system', 'SYSTÈME RÉINITIALISÉ - Tous les dons ont été effacés.');
    
    // Message de notification pour l'utilisateur
    showNarrativeMessage("Système réinitialisé. Tous les dons ont été effacés.", 5000);
    
    console.log("Tous les dons ont été réinitialisés");
    return true;
}

/**
 * Vérification des dons externes (via localStorage)
 */
function checkExternalDonations() {
    const latestDonation = localStorage.getItem('latestDonation');
    if (latestDonation) {
        try {
            const donation = JSON.parse(latestDonation);
            const lastProcessedDonation = localStorage.getItem('lastProcessedDonation') || '0';
            
            if (donation.timestamp > parseInt(lastProcessedDonation)) {
                // Ne pas débloquer automatiquement si le total n'atteint pas le seuil
                updateDonationProgress(donation.totalDonations || 0);
                
                // Traiter la donation
                simulateDonation(donation.username, donation.amount);
                localStorage.setItem('lastProcessedDonation', donation.timestamp.toString());
            }
        } catch (e) {
            console.error("Erreur lors du traitement d'une donation externe:", e);
        }
    }
} 
