// Module de communication Socket.IO pour les interfaces client (admin et sethos)
console.log('🔄 Initialisation du module client-socket.js...');

// Configuration
const SERVER_URL = 'http://localhost:3333';
let socket = null;
let isConnected = false;
let clientType = 'unknown'; // 'admin' ou 'sethos'
let reconnectInterval = null;
let eventListeners = {};

// Initialiser la connexion Socket.IO
function initSocket(type) {
    if (!type || (type !== 'admin' && type !== 'sethos')) {
        console.error('❌ Type de client invalide. Utilisez "admin" ou "sethos"');
        return false;
    }
    
    clientType = type;
    console.log(`🔄 Initialisation de la connexion Socket.IO en tant que "${clientType}"`);
    
    try {
        // Vérifier si la bibliothèque Socket.IO est chargée
        if (typeof io === 'undefined') {
            console.error('❌ La bibliothèque Socket.IO n\'est pas chargée');
            
            // Charger dynamiquement Socket.IO si nécessaire
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.6.0/socket.io.min.js';
            script.onload = function() {
                console.log('✅ Socket.IO chargé dynamiquement');
                connectSocket();
            };
            document.head.appendChild(script);
            return false;
        }
        
        connectSocket();
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation Socket.IO:', error);
        return false;
    }
}

// Établir la connexion Socket.IO
function connectSocket() {
    try {
        // Créer la connexion
        socket = io(SERVER_URL);
        
        // Gestionnaire d'événements de connexion
        socket.on('connect', () => {
            console.log(`✅ Connecté au serveur: ${socket.id}`);
            isConnected = true;
            
            // S'enregistrer auprès du serveur
            socket.emit('register_client', { type: clientType });
            
            // Effacer l'intervalle de reconnexion si présent
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
            }
            
            // Déclencher l'événement personnalisé de connexion
            triggerEvent('connected', { socketId: socket.id });
        });
        
        // Gestionnaire d'événements de déconnexion
        socket.on('disconnect', () => {
            console.log('❌ Déconnecté du serveur');
            isConnected = false;
            
            // Mettre en place une tentative de reconnexion automatique
            if (!reconnectInterval) {
                reconnectInterval = setInterval(() => {
                    console.log('🔄 Tentative de reconnexion...');
                    if (!isConnected && socket) {
                        socket.connect();
                    } else if (isConnected) {
                        clearInterval(reconnectInterval);
                        reconnectInterval = null;
                    }
                }, 5000); // Toutes les 5 secondes
            }
            
            // Déclencher l'événement personnalisé de déconnexion
            triggerEvent('disconnected');
        });
        
        // Gestionnaire pour l'état du système
        socket.on('system_state', (data) => {
            console.log('📊 État du système reçu:', data);
            triggerEvent('system_state', data);
        });
        
        // Gestionnaire pour les événements généraux
        socket.on('event', (data) => {
            console.log('📢 Événement reçu:', data);
            triggerEvent('event', data);
            
            // Traitement spécifique selon le type d'événement
            if (data.type === 'donation') {
                triggerEvent('donation', data);
            }
        });
        
        // Gestionnaire pour les événements TikTok
        socket.on('tiktokEvent', (data) => {
            console.log('🎬 Événement TikTok reçu:', data);
            triggerEvent('tiktokEvent', data);
        });
        
        // Gestionnaire pour les paliers activés
        socket.on('tier_activated', (data) => {
            console.log('🏆 Palier activé:', data);
            triggerEvent('tier_activated', data);
        });
        
        // Gestionnaire pour les actions spéciales
        socket.on('special_action', (data) => {
            console.log('🎬 Action spéciale reçue:', data);
            triggerEvent('special_action', data);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la connexion Socket.IO:', error);
        return false;
    }
}

// Simuler un don
function simulateDonation(amount, username, message) {
    if (!isConnected || !socket) {
        console.error('❌ Non connecté au serveur');
        return false;
    }
    
    const data = {
        amount: amount || 20,
        username: username || 'Anonyme',
        message: message || ''
    };
    
    console.log('💰 Simulation d\'un don:', data);
    socket.emit('simulateDonation', data);
    return true;
}

// Mettre à jour les seuils (thresholds)
function updateThresholds(thresholds) {
    if (!isConnected || !socket) {
        console.error('❌ Non connecté au serveur');
        return false;
    }
    
    if (!thresholds || !thresholds.tiers) {
        console.error('❌ Format de seuils invalide');
        return false;
    }
    
    console.log('🔄 Mise à jour des seuils:', thresholds);
    socket.emit('update_thresholds', thresholds);
    return true;
}

// Envoyer une action spéciale
function sendSpecialAction(action, params) {
    if (!isConnected || !socket) {
        console.error('❌ Non connecté au serveur');
        return false;
    }
    
    const data = {
        action: action,
        params: params || {},
        source: clientType,
        timestamp: new Date().toISOString()
    };
    
    console.log('🎬 Envoi d\'une action spéciale:', data);
    socket.emit('special_action', data);
    return true;
}

// Ajouter un écouteur d'événement personnalisé
function addEventListener(event, callback) {
    if (!eventListeners[event]) {
        eventListeners[event] = [];
    }
    
    eventListeners[event].push(callback);
    console.log(`📝 Écouteur ajouté pour l'événement "${event}"`);
    return true;
}

// Supprimer un écouteur d'événement personnalisé
function removeEventListener(event, callback) {
    if (!eventListeners[event]) {
        return false;
    }
    
    const index = eventListeners[event].indexOf(callback);
    if (index !== -1) {
        eventListeners[event].splice(index, 1);
        console.log(`🗑️ Écouteur supprimé pour l'événement "${event}"`);
        return true;
    }
    
    return false;
}

// Déclencher un événement personnalisé
function triggerEvent(event, data) {
    if (!eventListeners[event]) {
        return false;
    }
    
    eventListeners[event].forEach((callback) => {
        try {
            callback(data);
        } catch (error) {
            console.error(`❌ Erreur dans l'écouteur pour "${event}":`, error);
        }
    });
    
    return true;
}

// Vérifier l'état de la connexion
function isSocketConnected() {
    return isConnected;
}

// Se déconnecter explicitement
function disconnect() {
    if (socket) {
        socket.disconnect();
        isConnected = false;
        console.log('🔌 Déconnexion manuelle du serveur');
        
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        
        return true;
    }
    
    return false;
}

// Exposer les fonctions publiques
window.SethosSocket = {
    init: initSocket,
    simulateDonation: simulateDonation,
    updateThresholds: updateThresholds,
    sendSpecialAction: sendSpecialAction,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    isConnected: isSocketConnected,
    disconnect: disconnect
}; 