/**
 * Unified Socket.IO handler for Sethos AI
 * Ce fichier combine les fonctionnalités de:
 * - client-socket.js : Module de communication Socket.IO
 * - socket_fix.js : Correctifs pour les problèmes de Socket.IO
 * - socket_connection.js : Connexion Socket.IO pour l'expérience
 * - sethos_socket.js : Script de connexion temps réel
 * - socket_injector.js : Script d'injection pour Socket.IO
 */

(function() {
    console.log("🌐 Initialisation du module unifié de communication Socket.IO...");
    
    // Variables globales pour les connexions Socket.IO
    const SERVER_URL = 'http://localhost:3333';
    const TIKTOK_URL = 'http://localhost:8092';
    let mainSocket = null;
    let tiktokSocket = null;
    let isConnected = false;
    let reconnectInterval = null;
    let eventListeners = {};
    
    // ===== SECTION 1: CORRECTIFS POUR SOCKET.IO =====
    
    // Correction du problème "io is not defined"
    function fixSocketIOReference() {
        console.log('🔄 Vérification de la disponibilité de Socket.IO...');
        
        // Si io n'est pas défini, essayer de le charger
        if (typeof io === 'undefined') {
            console.log('⚠️ Socket.IO non détecté, injection du script...');
            
            // Créer une balise script pour charger Socket.IO
            const scriptTag = document.createElement('script');
            scriptTag.src = 'https://cdn.socket.io/4.6.0/socket.io.min.js';
            scriptTag.integrity = 'sha384-c79GN5VsunZvi+Q/WObgk2in0CbZsHnjEqvFxC5DxHn9lTfNce2WW6h2pH6u/kF+';
            scriptTag.crossOrigin = 'anonymous';
            
            // Attendre que le script soit chargé
            scriptTag.onload = function() {
                console.log('✅ Socket.IO chargé avec succès');
                // Tenter de se connecter après le chargement
                initSocketConnections();
            };
            
            // Gérer l'erreur de chargement
            scriptTag.onerror = function() {
                console.error('❌ Erreur lors du chargement de Socket.IO');
            };
            
            // Ajouter le script au document
            document.head.appendChild(scriptTag);
            
            return false; // Socket.IO n'était pas disponible
        }
        
        return true; // Socket.IO était déjà disponible
    }
    
    // ===== SECTION 2: FONCTIONS DE CONNEXION ET ÉVÉNEMENTS =====
    
    // Initialiser la connexion Socket.IO
    function initSocketConnections() {
        // Vérifier si Socket.IO est disponible
        if (typeof io === 'undefined') {
            fixSocketIOReference();
            return;
        }
        
        // Fermer les connexions existantes
        disconnectAllSockets();
        
        try {
            // Connexion au serveur principal
            console.log(`🔄 Connexion au serveur principal: ${SERVER_URL}`);
            mainSocket = io(SERVER_URL);
            
            // Gestionnaire d'événements de connexion
            mainSocket.on('connect', () => {
                console.log(`✅ Connecté au serveur principal: ${mainSocket.id}`);
                isConnected = true;
                
                // S'enregistrer auprès du serveur
                mainSocket.emit('register_client', { type: 'sethos' });
                
                // Effacer l'intervalle de reconnexion si présent
                if (reconnectInterval) {
                    clearInterval(reconnectInterval);
                    reconnectInterval = null;
                }
                
                // Déclencher l'événement personnalisé de connexion
                triggerEvent('connected', { socketId: mainSocket.id });
            });
            
            // Gestionnaire d'événements de déconnexion
            mainSocket.on('disconnect', () => {
                console.log('❌ Déconnecté du serveur principal');
                isConnected = false;
                
                // Mettre en place une tentative de reconnexion automatique
                if (!reconnectInterval) {
                    reconnectInterval = setInterval(() => {
                        console.log('🔄 Tentative de reconnexion au serveur principal...');
                        if (!isConnected && mainSocket) {
                            mainSocket.connect();
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
            mainSocket.on('system_state', (data) => {
                console.log('📊 État du système reçu:', data);
                triggerEvent('system_state', data);
            });
            
            // Gestionnaire pour les événements généraux
            mainSocket.on('event', (data) => {
                console.log('📢 Événement reçu:', data);
                triggerEvent('event', data);
                
                // Traitement spécifique selon le type d'événement
                if (data.type === 'donation') {
                    triggerEvent('donation', data);
                    handleDonation(data.username, data.amount, data.message || '');
                } else if (data.type === 'trigger_event') {
                    // Déclencher un événement spécial
                    if (typeof triggerSpecialEvent === 'function') {
                        triggerSpecialEvent(data.username || 'Admin');
                    }
                } else if (data.type === 'reveal_clue') {
                    // Révéler un indice
                    if (typeof revealRandomClue === 'function') {
                        revealRandomClue(data.username || 'Admin');
                    }
                } else if (data.type === 'game_action' && data.action) {
                    // Gérer une action de jeu spécifique de l'admin
                    processGameAction(data);
                }
            });
            
            // Gestionnaire pour les paliers activés
            mainSocket.on('tier_activated', (data) => {
                console.log('🏆 Palier activé:', data);
                triggerEvent('tier_activated', data);
            });
            
            // Gestionnaire pour les actions spéciales
            mainSocket.on('special_action', (data) => {
                console.log('🎬 Action spéciale reçue:', data);
                triggerEvent('special_action', data);
            });
            
            // Connexion au serveur TikTok
            console.log(`🔄 Connexion au serveur TikTok: ${TIKTOK_URL}`);
            tiktokSocket = io(TIKTOK_URL);
            
            // Gestionnaire d'événements de connexion TikTok
            tiktokSocket.on('connect', () => {
                console.log(`✅ Connecté au serveur TikTok: ${tiktokSocket.id}`);
                // Déclencher l'événement personnalisé
                triggerEvent('tiktok_connected', { socketId: tiktokSocket.id });
            });
            
            // Gestionnaire d'événements de déconnexion TikTok
            tiktokSocket.on('disconnect', () => {
                console.log('❌ Déconnecté du serveur TikTok');
                // Déclencher l'événement personnalisé
                triggerEvent('tiktok_disconnected');
            });
            
            // Gestionnaire pour les événements TikTok
            tiktokSocket.on('tiktokEvent', (data) => {
                console.log('📱 Événement TikTok reçu:', data);
                triggerEvent('tiktokEvent', data);
                
                // Traiter l'événement TikTok
                if (typeof processTikTokEvent === 'function') {
                    processTikTokEvent(data);
                } else if (data.type === 'donation') {
                    handleDonation(data.username, data.amount, data.message || '');
                }
            });
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation des connexions Socket.IO:', error);
        }
    }
    
    // Déconnecter toutes les sockets
    function disconnectAllSockets() {
        if (mainSocket && mainSocket.connected) {
            console.log('🔌 Déconnexion du serveur principal...');
            mainSocket.disconnect();
        }
        
        if (tiktokSocket && tiktokSocket.connected) {
            console.log('🔌 Déconnexion du serveur TikTok...');
            tiktokSocket.disconnect();
        }
        
        // Réinitialiser les variables
        isConnected = false;
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    }
    
    // Fonction pour traiter un don reçu via Socket.IO
    function handleDonation(username, amount, message) {
        console.log(`💰 Don reçu: ${amount}€ de ${username} - "${message}"`);
        
        // Utiliser la fonction existante si disponible
        if (typeof simulateDonation === 'function') {
            simulateDonation(username, amount, message);
        } else if (typeof processAuthDonation === 'function') {
            processAuthDonation({
                username: username,
                amount: amount,
                message: message,
                timestamp: new Date().toISOString()
            });
        } else if (typeof window.simulateDonation === 'function') {
            window.simulateDonation(username, amount, message);
        } else {
            console.warn('⚠️ Aucune fonction de traitement des dons n\'est disponible');
        }
    }
    
    // Fonction pour traiter une action de jeu
    function processGameAction(data) {
        console.log('🎮 Action de jeu reçue:', data.action);
        
        switch(data.action) {
            case 'spawn_entity':
                if (typeof spawnSpecialEntity === 'function') {
                    spawnSpecialEntity();
                }
                break;
            case 'ambient_effect':
                if (typeof triggerAmbientEffect === 'function') {
                    triggerAmbientEffect(data.intensity || 5);
                }
                break;
            // Ajouter d'autres actions au besoin
            default:
                console.log(`Action de jeu non reconnue: ${data.action}`);
        }
    }
    
    // ===== SECTION 3: API PUBLIQUE =====
    
    // Simuler un don
    function simulateDonation(amount, username, message) {
        if (!isSocketConnected()) {
            console.error('❌ Non connecté au serveur');
            return false;
        }
        
        const data = {
            amount: amount || 20,
            username: username || 'Anonyme',
            message: message || ''
        };
        
        console.log('💰 Simulation d\'un don:', data);
        
        // Envoyer au serveur principal si disponible
        if (mainSocket && mainSocket.connected) {
            mainSocket.emit('simulateDonation', data);
        }
        
        // Envoyer également au serveur TikTok si disponible
        if (tiktokSocket && tiktokSocket.connected) {
            tiktokSocket.emit('simulateDonation', data);
        }
        
        return true;
    }
    
    // Mettre à jour les seuils (thresholds)
    function updateThresholds(thresholds) {
        if (!isSocketConnected()) {
            console.error('❌ Non connecté au serveur');
            return false;
        }
        
        if (!thresholds || !thresholds.tiers) {
            console.error('❌ Format de seuils invalide');
            return false;
        }
        
        console.log('🔄 Mise à jour des seuils:', thresholds);
        mainSocket.emit('update_thresholds', thresholds);
        return true;
    }
    
    // Envoyer une action spéciale
    function sendSpecialAction(action, params) {
        if (!isSocketConnected()) {
            console.error('❌ Non connecté au serveur');
            return false;
        }
        
        const data = {
            action: action,
            params: params || {},
            source: 'client',
            timestamp: new Date().toISOString()
        };
        
        console.log('🎬 Envoi d\'une action spéciale:', data);
        mainSocket.emit('special_action', data);
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
        
        const initialLength = eventListeners[event].length;
        eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
        
        const removed = initialLength > eventListeners[event].length;
        if (removed) {
            console.log(`🗑️ Écouteur supprimé pour l'événement "${event}"`);
        }
        
        return removed;
    }
    
    // Déclencher un événement personnalisé
    function triggerEvent(event, data) {
        if (!eventListeners[event]) {
            return false;
        }
        
        eventListeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`❌ Erreur dans l'écouteur pour l'événement "${event}":`, error);
            }
        });
        
        return true;
    }
    
    // Vérifier si la socket est connectée
    function isSocketConnected() {
        return isConnected && mainSocket;
    }
    
    // ===== SECTION 4: INITIALISATION ET EXPOSITION =====
    
    // Fonction d'initialisation principale
    function init(type) {
        // Vérifier que Socket.IO est disponible
        if (!fixSocketIOReference()) {
            return; // fixSocketIOReference chargera io et appellera initSocketConnections quand c'est prêt
        }
        
        // Initialiser les connexions
        initSocketConnections();
        
        console.log('✅ Module Socket.IO unifié initialisé');
    }
    
    // Exposer les fonctions au scope global
    window.socketAPI = {
        init: init,
        simulateDonation: simulateDonation,
        updateThresholds: updateThresholds,
        sendSpecialAction: sendSpecialAction,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        isConnected: isSocketConnected,
        disconnect: disconnectAllSockets
    };
    
    // Initialiser automatiquement au chargement du document
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 