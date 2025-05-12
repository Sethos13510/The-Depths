/**
 * Module d'interface utilisateur
 */

// Variables pour les messages
let messageQueue = [];
let isShowingMessage = false;

/**
 * Initialisation de l'interface utilisateur
 */
function initializeUI() {
    // Configurer le bouton d'authentification
    setupAuthButton();
    
    // Configurer le bouton du simulateur de dons
    setupDonationSimulatorButton();
    
    // Vérifier les donations externes périodiquement
    setInterval(checkExternalDonations, 5000);
}

/**
 * Configuration du bouton d'authentification
 */
function setupAuthButton() {
    const authAcceptButton = document.getElementById('auth-accept');
    if (authAcceptButton) {
        // Modifier l'apparence du bouton pour indiquer qu'il est désactivé
        authAcceptButton.style.opacity = '0.5';
        authAcceptButton.style.cursor = 'not-allowed';
        
        // Ajouter un message sur le survol
        authAcceptButton.addEventListener('mouseover', function() {
            const remaining = (DONATION_THRESHOLD - (totalDonations || 0)).toFixed(2);
            showNarrativeMessage(translate('Un don total de %s est nécessaire pour débloquer l\'accès. Il manque %s.', 
                DONATION_THRESHOLD + '€', remaining + '€'), 3000);
        });
        
        // Empêcher le bouton de fonctionner
        authAcceptButton.addEventListener('click', function(e) {
            e.preventDefault();
            const remaining = (DONATION_THRESHOLD - (totalDonations || 0)).toFixed(2);
            showNarrativeMessage(translate('Authentification refusée. Il manque %s pour atteindre le seuil requis.', 
                remaining + '€'), 4000);
        });
    }
}

/**
 * Configuration du bouton du simulateur de dons
 */
function setupDonationSimulatorButton() {
    const openSimulatorAuth = document.getElementById('open-simulator-auth');
    if (openSimulatorAuth) {
        openSimulatorAuth.addEventListener('click', function() {
            const simulatorWindow = window.open('donation_simulator.html', 'DonationSimulator', 'width=400,height=600');
            showNarrativeMessage(translate('Utilisez le simulateur pour faire un don et débloquer l\'accès (%s requis).', 
                DONATION_THRESHOLD + '€'), 4000);
        });
    }
}

/**
 * Animation de chargement
 */
function simulateLoading() {
    // Ne s'exécute que si le seuil est atteint
    if (totalDonations >= DONATION_THRESHOLD) {
        // Cacher la barre de progression des dons
        const donationRequirement = document.querySelector('.donation-requirement');
        if (donationRequirement) {
            donationRequirement.style.display = 'none';
        }
        
        // Afficher la barre de chargement
        const loadProgressContainer = document.getElementById('load-progress-container');
        if (loadProgressContainer) {
            loadProgressContainer.style.display = 'block';
        }
        
        let progress = 5;
        const loadProgressBar = document.getElementById('load-progress');
        
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 3;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Initialiser l'écran principal
                setTimeout(() => {
                    document.getElementById('loading').style.display = 'none';
                    initializeMainScreen();
                }, 500);
            }
            loadProgressBar.style.width = progress + '%';
        }, 300);
    } else {
        showNarrativeMessage(translate('Un don total de %s est requis pour débloquer l\'expérience.', 
            DONATION_THRESHOLD + '€'), 4000);
    }
}

/**
 * Débloquer l'écran d'authentification
 */
function unlockAuthScreen() {
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay && authOverlay.style.display !== 'none') {
        // Ne débloquer que si le seuil est atteint
        if (totalDonations >= DONATION_THRESHOLD) {
            // Transition en fondu
            authOverlay.style.opacity = '0';
            setTimeout(() => {
                authOverlay.style.display = 'none';
                
                // Initialisation après authentification
                initializeAfterAuth();
                
                // Message dans le journal
                addToStoryHistory('system', translate('Accès au terminal autorisé. Système initialisé.'));
            }, 1000);
            
            // Lancer le chargement
            simulateLoading();
        }
    }
}

/**
 * Affichage d'un message narratif
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en ms
 */
function showNarrativeMessage(message, duration = 5000) {
    // Ajouter à la file d'attente
    messageQueue.push({ text: message, duration: duration });
    
    // Si aucun message n'est en cours d'affichage, lancer le premier
    if (!isShowingMessage) {
        displayNextMessage();
    }
}

/**
 * Affichage du prochain message dans la file
 */
function displayNextMessage() {
    if (messageQueue.length === 0) {
        isShowingMessage = false;
        return;
    }
    
    isShowingMessage = true;
    const nextMessage = messageQueue.shift();
    
    // Créer ou réutiliser l'élément de message
    let messageElement = document.getElementById('narrative-message');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'narrative-message';
        document.body.appendChild(messageElement);
    }
    
    // Animer l'apparition
    messageElement.textContent = nextMessage.text;
    messageElement.style.display = 'block';
    messageElement.style.opacity = '0';
    
    setTimeout(() => {
        messageElement.style.opacity = '1';
        
        // Programmer la disparition
        setTimeout(() => {
            messageElement.style.opacity = '0';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
                displayNextMessage(); // Afficher le message suivant
            }, 500);
        }, nextMessage.duration);
    }, 50);
}

/**
 * Ajout d'une entrée à l'historique
 * @param {string} type - Type d'entrée (milestone, discovery, event, etc.)
 * @param {string} content - Contenu de l'entrée
 */
function addToStoryHistory(type, content) {
    // Initialiser l'historique s'il n'existe pas
    if (!window.storyHistory) {
        window.storyHistory = [];
    }
    
    // Ajouter l'entrée
    window.storyHistory.unshift({
        type: type,
        content: content,
        timestamp: new Date().toLocaleTimeString()
    });
    
    // Limiter la taille de l'historique
    if (window.storyHistory.length > 50) {
        window.storyHistory = window.storyHistory.slice(0, 50);
    }
    
    // Mettre à jour l'affichage
    renderStoryHistory();
}

/**
 * Affichage de l'historique
 */
function renderStoryHistory() {
    const historyList = document.getElementById('story-history-list');
    if (!historyList || !window.storyHistory) return;
    
    historyList.innerHTML = '';
    
    // Créer un conteneur pour l'auto-défilement
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'autoscroll-container';
    
    const scrollContent = document.createElement('div');
    scrollContent.className = 'autoscroll-content';
    
    // Calculer la durée de l'animation
    const durationInSeconds = Math.max(20, Math.min(60, window.storyHistory.length * 4));
    scrollContent.style.animationDuration = durationInSeconds + 's';
    
    // En-têtes pour les types d'entrées
    const typeLabels = {
        'milestone': translate('📊 Progression'),
        'discovery': translate('🔎 Découverte'),
        'event': translate('⚡ Événement'),
        'donation': translate('💰 Don'),
        'system': translate('⚙️ Système')
    };
    
    window.storyHistory.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = `history-item history-item-${entry.type}`;
        
        // Ajouter un numéro d'entrée
        const entryNumber = document.createElement('div');
        entryNumber.className = 'history-number';
        entryNumber.textContent = `#${index + 1}`;
        entryNumber.style.position = 'absolute';
        entryNumber.style.right = '5px';
        entryNumber.style.top = '3px';
        entryNumber.style.fontSize = '8px';
        entryNumber.style.color = '#aaa';
        entryNumber.style.fontWeight = 'bold';
        
        const timestamp = document.createElement('div');
        timestamp.className = 'history-timestamp';
        timestamp.textContent = entry.timestamp;
        
        const typeLabel = document.createElement('div');
        typeLabel.style.fontWeight = 'bold';
        typeLabel.style.fontSize = '10px';
        typeLabel.style.marginBottom = '2px';
        typeLabel.textContent = typeLabels[entry.type] || 'Message';
        
        const content = document.createElement('div');
        content.textContent = entry.content;
        
        item.appendChild(entryNumber);
        item.appendChild(timestamp);
        item.appendChild(typeLabel);
        item.appendChild(content);
        
        scrollContent.appendChild(item);
    });
    
    scrollContainer.appendChild(scrollContent);
    historyList.appendChild(scrollContainer);
} 