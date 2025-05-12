/**
 * Translation module for Sethos AI
 * Contains all the messages translated from French to English
 */

// Translation object
const translations = {
    // UI messages
    'Un don total de %s est nécessaire pour débloquer l\'accès. Il manque %s.': 
        'A total donation of %s is required to unlock access. %s remaining.',
    'Authentification refusée. Il manque %s pour atteindre le seuil requis.': 
        'Authentication denied. %s remaining to reach the required threshold.',
    'Utilisez le simulateur pour faire un don et débloquer l\'accès (%s requis).': 
        'Use the simulator to make a donation and unlock access (%s required).',
    'Un don total de %s est requis pour débloquer l\'expérience.': 
        'A total donation of %s is required to unlock the experience.',
    'Accès au terminal autorisé. Système initialisé.': 
        'Terminal access authorized. System initialized.',
        
    // Warning message with fixed encoding
    'AVERTISSEMENT: Vous êtes sur le point d\'accéder à un réseau non autorisé.\n\nCe terminal sert d\'interface aux communications internes du groupe THE-DEPTHS.\nToute intrusion non autorisée sera tracée et signalée aux administrateurs.\n\nCet accès est seulement destiné aux membres confirmés.':
        'WARNING: You are about to access an unauthorized network.\n\nThis terminal serves as an interface to the internal communications of THE-DEPTHS group.\nAny unauthorized intrusion will be traced and reported to administrators.\n\nThis access is only intended for confirmed members.',
    
    // Individual parts of the warning message
    'AVERTISSEMENT: Vous êtes sur le point d\'accéder à un réseau non autorisé.':
        'WARNING: You are about to access an unauthorized network.',
    'Ce terminal sert d\'interface aux communications internes du groupe THE-DEPTHS.':
        'This terminal serves as an interface to the internal communications of THE-DEPTHS group.',
    'Toute intrusion non autorisée sera tracée et signalée aux administrateurs.':
        'Any unauthorized intrusion will be traced and reported to administrators.',
    'Cet accès est seulement destiné aux membres confirmés.':
        'This access is only intended for confirmed members.',

    // Additional auth and security messages
    'Connexion aux systèmes de sécurité en cours...':
        'Connecting to security systems...',
    'AUTHENTIFICATION VERROUILLÉE':
        'AUTHENTICATION LOCKED',
    'SYSTÈME DE SÉCURITÉ: L\'accès à cette interface est strictement contrôlé. Une authentification externe est nécessaire pour débloquer le terminal.':
        'SECURITY SYSTEM: Access to this interface is strictly controlled. External authentication is required to unlock the terminal.',
    'SYSTÈME HORS LIGNE':
        'SYSTEM OFFLINE',
    'Chargement de l\'expérience...':
        'Loading experience...',
    'Détails d\'Exploration':
        'Exploration Details',
    'PROGRESSION:':
        'PROGRESS:',
    'DÉBUT':
        'START',
    'FIN':
        'END',
    'Votre participation stabilise la connexion et révèle de nouveaux mystères':
        'Your participation stabilizes the connection and reveals new mysteries',

    // Story progress
    'Progression': 'Progress',
    'Découverte': 'Discovery',
    'Événement': 'Event',
    'Don': 'Donation',
    'Système': 'System',
    'Prochain objectif:': 'Next objective:',
    'Chapitre activé:': 'Chapter activated:',
    
    // Effects and messages
    'Le rituel sera accompli.': 'The ritual will be accomplished.',
    'Les profondeurs appellent.': 'The depths are calling.',
    'La vérité est immergée.': 'The truth is submerged.',
    'L\'éveil approche.': 'The awakening approaches.',
    'Rejoignez-nous sous la surface.': 'Join us beneath the surface.',
    'Le passage s\'ouvre.': 'The passage opens.',
    'L\'ancien texte prédit votre venue.': 'The ancient text predicts your arrival.',
    'La porte est verrouillée à clé.': 'The door is locked.',
    'Les coordonnées ont été transmises.': 'The coordinates have been transmitted.',
    'Nous vous observons depuis longtemps.': 'We have been watching you for a long time.',
    
    // Common words/phrases
    'Indice': 'Hint',
    'découvert': 'discovered',
    'révèle': 'reveals',
    'Mystère': 'Mystery',
    'événement': 'event',
    'apparition': 'apparition',
    'distorsion': 'distortion',
    'Son joué:': 'Sound played:',
    'Son système': 'System sound',
    'Notification système': 'System notification',
    'Événement personnalisé': 'Custom event',
    
    // Icons to replace character issues
    '??': '🔍',  // For discovery
    '?': '❗',   // For events
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å"Ã…â€œ': '📊',  // Progress
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â': '🔎',  // Discovery
    'ÃƒÂ¢Ã…Â¡Ã‚Â¡': '⚡',      // Event
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â°': '💰',  // Donation
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬â€œÃ‚Â¥ÃƒÂ¯Ã‚Â¸Ã‚Â': '⚙️'  // System
};

/**
 * Translate a text from French to English
 * @param {string} text - Text to translate
 * @param {...string} params - Parameters to replace %s in the translated text
 * @returns {string} - Translated text
 */
function translate(text, ...params) {
    // Get the translation or use the original text if no translation exists
    let translatedText = translations[text] || text;
    
    // Replace %s with parameters
    if (params.length > 0) {
        params.forEach(param => {
            translatedText = translatedText.replace('%s', param);
        });
    }
    
    return translatedText;
}

/**
 * Initialize translations on page load
 * Apply translations to static HTML elements
 */
function initializeTranslations() {
    // Warning message
    const warningMessage = document.getElementById('auth-warning-message');
    if (warningMessage) {
        warningMessage.innerHTML = translate('AVERTISSEMENT: Vous êtes sur le point d\'accéder à un réseau non autorisé.') + '<br><br>' +
            translate('Ce terminal sert d\'interface aux communications internes du groupe THE-DEPTHS.') + '<br>' +
            translate('Toute intrusion non autorisée sera tracée et signalée aux administrateurs.') + '<br><br>' +
            translate('Cet accès est seulement destiné aux membres confirmés.');
    }
    
    // Security connecting message
    const securityConnecting = document.getElementById('security-systems-connecting');
    if (securityConnecting) {
        securityConnecting.textContent = translate('Connexion aux systèmes de sécurité en cours...');
    }
    
    // Auth button
    const authButton = document.getElementById('auth-accept');
    if (authButton) {
        authButton.textContent = translate('AUTHENTIFICATION VERROUILLÉE');
    }
    
    // Security warning
    const securityWarning = document.getElementById('auth-security-warning');
    if (securityWarning) {
        securityWarning.textContent = translate('SYSTÈME DE SÉCURITÉ: L\'accès à cette interface est strictement contrôlé. Une authentification externe est nécessaire pour débloquer le terminal.');
    }
    
    // System status
    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.textContent = translate('SYSTÈME HORS LIGNE');
    }
    
    // Loading message
    const loadingMessage = document.querySelector('#loading div:last-child');
    if (loadingMessage) {
        loadingMessage.textContent = translate('Chargement de l\'expérience...');
    }
    
    // Details button
    const detailsButton = document.querySelector('#details-button span:last-child');
    if (detailsButton) {
        detailsButton.textContent = translate('Détails d\'Exploration');
    }
    
    // Progress display
    const progressLabel = document.querySelector('#progress-display span:first-child');
    if (progressLabel) {
        progressLabel.textContent = translate('PROGRESSION:') + ' ';
    }
    
    const startLabel = document.querySelector('#progress-display div:nth-of-type(3) span:first-child');
    if (startLabel) {
        startLabel.textContent = translate('DÉBUT');
    }
    
    const endLabel = document.querySelector('#progress-display div:nth-of-type(3) span:last-child');
    if (endLabel) {
        endLabel.textContent = translate('FIN');
    }
    
    const connectionInfo = document.querySelector('#progress-display div:last-child');
    if (connectionInfo) {
        connectionInfo.textContent = translate('Votre participation stabilise la connexion et révèle de nouveaux mystères');
    }
}

/**
 * Change the application language
 * @param {string} lang - The language code ('en' for English, 'fr' for French)
 */
function changeLanguage(lang) {
    console.log(`Changing language to: ${lang}`);
    
    // Store the language preference in localStorage
    localStorage.setItem('sethosLanguage', lang);
    window.currentLanguage = lang;
    
    // Apply translations based on the selected language
    if (lang === 'en') {
        // Apply English translations
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (window.translateToEnglish && key) {
                element.textContent = translateToEnglish(key);
            }
        });
        
        // Update any hardcoded text that needs translation
        const warningMessage = document.getElementById('auth-warning-message');
        if (warningMessage) {
            warningMessage.innerHTML = translateToEnglish('auth_message_warning');
        }
        
        // Translate panel titles
        const historyPanelTitle = document.querySelector('#story-history-panel h3');
        if (historyPanelTitle) {
            historyPanelTitle.textContent = translateToEnglish('journal_des_messages');
        }
        
        const leaderboardPanelTitle = document.querySelector('#leaderboard-panel h3');
        if (leaderboardPanelTitle) {
            leaderboardPanelTitle.textContent = translateToEnglish('classement_explorateurs');
        }
        
        const top100PanelTitle = document.querySelector('#top100-panel h4');
        if (top100PanelTitle) {
            top100PanelTitle.textContent = translateToEnglish('top_100_explorateurs');
        }
        
        // Hide the TOP 100 panel
        const top100Panel = document.getElementById('top100-panel');
        if (top100Panel) {
            top100Panel.style.display = 'none';
        }
        
        // Ensure there's only one message log visible
        document.querySelectorAll('.duplicate-history-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Ensure the main message log is properly styled
        const historyPanel = document.getElementById('story-history-panel');
        if (historyPanel) {
            historyPanel.style.display = 'block';
            historyPanel.classList.remove('duplicate-history-panel');
        }
        
        // Update votes panel
        const votePanelTitle = document.querySelector('#vote-panel h4');
        if (votePanelTitle) {
            votePanelTitle.textContent = translateToEnglish('vote_communautaire_titre');
        }
        
        const voteQuestion = document.getElementById('vote-question');
        if (voteQuestion) {
            voteQuestion.textContent = translateToEnglish('vote_question_portes');
        }
        
        // Translate vote options
        const voteOptions = document.querySelectorAll('.vote-option span:first-child');
        if (voteOptions && voteOptions.length > 0) {
            voteOptions.forEach(option => {
                // Translate common door options
                if (option.textContent.includes('Porte avec symbole spirale')) {
                    option.textContent = translateToEnglish('porte_symbole_spirale');
                } else if (option.textContent.includes('Porte rouge clignotante')) {
                    option.textContent = translateToEnglish('porte_rouge_clignotante');
                } else if (option.textContent.includes('Porte avec marques de griffes')) {
                    option.textContent = translateToEnglish('porte_marques_griffes');
                }
            });
        }
        
        // Translate vote timer message
        const voteTimer = document.querySelector('#vote-panel p:last-child');
        if (voteTimer) {
            const timerSpan = voteTimer.querySelector('span');
            const timerValue = timerSpan ? timerSpan.textContent : '';
            voteTimer.innerHTML = translateToEnglish('vote_interaction') + ' <span id="vote-timer">' + timerValue + '</span>';
        }
        
        // Additional translation logic for dynamic content
        console.log("English language applied");
        
        // Manually translate story history entries if they exist
        if (window.storyHistory && window.storyHistory.length > 0) {
            window.storyHistory.forEach(entry => {
                // Directly translate common French welcome messages
                if (entry.content === "Bienvenue dans Les Profondeurs") {
                    entry.content = "Welcome to The Depths";
                } 
                else if (entry.content.includes("Bienvenue dans Les Profondeurs. Les portes cachent des secrets")) {
                    entry.content = "Welcome to The Depths. The doors hide secrets. It's up to you to discover them...";
                }
                // Translate other common messages
                else if (entry.content === "Connected to command server") {
                    // Keep as is - already in English
                } 
                else if (entry.content === "Explorez les tunnels à la recherche d'indices") {
                    entry.content = "Explore the tunnels for clues";
                }
                else if (entry.content === "Attention aux entités mystérieuses") {
                    entry.content = "Beware of mysterious entities";
                }
            });
        }
        
        // Force re-render message history to apply translations
        if (window.renderStoryHistory) {
            window.renderStoryHistory();
        }
        
        // Re-render leaderboard to apply translations
        if (window.renderLeaderboard) {
            window.renderLeaderboard();
        }
    } else {
        // Default to French (original language)
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key) {
                // Revert to original French text
                element.textContent = key;
            }
        });
        
        // Show the TOP 100 panel again in French mode
        const top100Panel = document.getElementById('top100-panel');
        if (top100Panel) {
            top100Panel.style.display = 'block';
        }
        
        // Ensure there's only one message log visible
        document.querySelectorAll('.duplicate-history-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Ensure the main message log is properly styled
        const historyPanel = document.getElementById('story-history-panel');
        if (historyPanel) {
            historyPanel.style.display = 'block';
            historyPanel.classList.remove('duplicate-history-panel');
        }
        
        // Manually revert story history entries if they exist
        if (window.storyHistory && window.storyHistory.length > 0) {
            window.storyHistory.forEach(entry => {
                // Revert translated welcome messages
                if (entry.content === "Welcome to The Depths") {
                    entry.content = "Bienvenue dans Les Profondeurs";
                } 
                else if (entry.content.includes("Welcome to The Depths. The doors hide secrets")) {
                    entry.content = "Bienvenue dans Les Profondeurs. Les portes cachent des secrets. À vous de les découvrir...";
                }
                // Revert other common messages
                else if (entry.content === "Explore the tunnels for clues") {
                    entry.content = "Explorez les tunnels à la recherche d'indices";
                }
                else if (entry.content === "Beware of mysterious entities") {
                    entry.content = "Attention aux entités mystérieuses";
                }
            });
        }
        
        // Reinitialize French translations
        initializeTranslations();
        console.log("French language applied");
        
        // Re-render message history to apply translations
        if (window.renderStoryHistory) {
            window.renderStoryHistory();
        }
    }
}

// On page load, check for saved language preference
function checkSavedLanguage() {
    // Fix duplicate message log panels - this is a direct fix for the issue
    setTimeout(() => {
        const logPanels = document.querySelectorAll('[id="story-history-panel"]');
        console.log(`Found ${logPanels.length} message log panels`);
        
        // If we find multiple panels, keep only the first one
        if (logPanels.length > 1) {
            for (let i = 1; i < logPanels.length; i++) {
                console.log(`Hiding duplicate message log panel ${i}`);
                logPanels[i].style.display = 'none';
            }
        }
    }, 300);
    
    // Continue with normal language handling
    const savedLang = localStorage.getItem('sethosLanguage');
    if (savedLang) {
        // Update the language selector dropdown
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.value = savedLang;
        }
        // Apply the saved language
        changeLanguage(savedLang);
        
        // Fix encoding issues in message log
        setTimeout(() => {
            if (window.renderStoryHistory) {
                console.log("Re-rendering story history to fix encoding issues");
                window.renderStoryHistory();
            }
        }, 500);
    }
}

// Make the translation function available globally
window.translate = translate;

// Make sure the renderStoryHistory function is available globally
document.addEventListener('DOMContentLoaded', () => {
    // Find the renderStoryHistory function and make it globally available
    if (typeof renderStoryHistory === 'function' && !window.renderStoryHistory) {
        console.log("Exposing renderStoryHistory function globally");
        window.renderStoryHistory = renderStoryHistory;
    }
    
    // Detect and handle duplicate message logs
    const historyPanels = document.querySelectorAll('#story-history-panel');
    console.log(`Found ${historyPanels.length} message log panels`);
    
    if (historyPanels.length > 1) {
        // Keep only the first one, mark others as duplicates
        for (let i = 1; i < historyPanels.length; i++) {
            historyPanels[i].classList.add('duplicate-history-panel');
            historyPanels[i].style.display = 'none';
            console.log(`Marked duplicate message log panel #${i}`);
        }
    }
    
    initializeTranslations();
    checkSavedLanguage();
}); 