/**
 * Unified Server for Sethos AI
 * Ce fichier combine les fonctionnalités de plusieurs serveurs :
 * - central-server.js : Serveur principal
 * - direct-tiktok-server.js : Serveur TikTok
 * - sethos-server.js : Fonctionnalités spécifiques à Sethos
 * - sethos-tiktok.js : Intégration TikTok pour Sethos
 */

// Importation des modules nécessaires
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dataManager = require('./data_manager');

// Vérifier si on est en mode TikTok seulement
const isTikTokOnly = process.argv.includes('--tiktok-only');

// Configuration
const CENTRAL_PORT = 3333;
const TIKTOK_PORT = 8092;
const centralApp = express();
const tiktokApp = express();
const centralServer = http.createServer(centralApp);
const tiktokServer = http.createServer(tiktokApp);
const centralIO = new Server(centralServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const tiktokIO = new Server(tiktokServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware pour les deux serveurs
centralApp.use(cors());
centralApp.use(express.json());
tiktokApp.use(cors());
tiktokApp.use(express.json());

// Ajout des répertoires statiques
centralApp.use(express.static(path.join(__dirname)));
centralApp.use(express.static(path.join(__dirname, '..', '..')));
centralApp.use(express.static(path.join(__dirname, '..')));

// Référence au système de données unifié
let systemState = {
    socket: {
        adminClients: new Set(),
        sethosClients: new Set(),
        totalClients: 0
    }
};

// Gestion des fichiers de données
const EVENT_JSON_PATH = path.join(__dirname, '..', '..', 'event', 'event.json');

// ===== ROUTES POUR LE SERVEUR CENTRAL =====

// Rediriger la racine vers new_admin.html
centralApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'new_admin.html'));
});

// API de statut du serveur
centralApp.get('/api/status', (req, res) => {
    const unifiedData = dataManager.getUnifiedData();
    
    res.json({
        success: true,
        status: 'running',
        connectedClients: systemState.socket.totalClients,
        uptime: process.uptime(),
        tiktok: {
            connected: unifiedData.tiktok.connected,
            likes: unifiedData.tiktok.likes,
            shares: unifiedData.tiktok.shares
        }
    });
});

// API pour charger les données d'histoire
centralApp.get('/api/story/load', (req, res) => {
    try {
        const storyData = dataManager.getStoryData();
        res.json({
            success: true,
            data: storyData
        });
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données d\'histoire:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API pour sauvegarder les données d'histoire
centralApp.post('/api/story/save', (req, res) => {
    try {
        const storyData = req.body;
        dataManager.saveStoryData(storyData);
        res.json({
            success: true,
            message: 'Données d\'histoire sauvegardées avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des données d\'histoire:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API pour récupérer les événements
centralApp.get('/api/events', (req, res) => {
    try {
        const unifiedData = dataManager.getUnifiedData();
        res.json({
            success: true,
            events: unifiedData.story.events || []
        });
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des événements:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API pour réinitialiser la progression d'authentification
centralApp.post('/api/reset-auth-progress', (req, res) => {
    try {
        const unifiedData = dataManager.getUnifiedData();
        
        // Réinitialiser les données d'authentification
        const updatedAuth = {
            ...unifiedData.auth,
            progress: 0,
            authenticated: false
        };
        
        // Enregistrer les changements
        dataManager.updateUnifiedData('auth', updatedAuth);
        
        // Diffuser les changements
        broadcastSystemState();
        
        res.json({
            success: true,
            message: 'Progression d\'authentification réinitialisée',
            auth: updatedAuth
        });
    } catch (error) {
        console.error('❌ Erreur lors de la réinitialisation de la progression:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API de vérification du token de session
centralApp.get('/api/session-token', (req, res) => {
    const unifiedData = dataManager.getUnifiedData();
    
    res.json({
        success: true,
        auth: unifiedData.auth,
        authenticated: unifiedData.auth.authenticated,
        progress: unifiedData.auth.progress,
        required: unifiedData.auth.required
    });
});

// API pour récupérer l'état du système
centralApp.get('/api/system-state', (req, res) => {
    const unifiedData = dataManager.getUnifiedData();
    
    // Fusionner les données dynamiques (socket) avec les données unifiées
    const stateToSend = {
        ...unifiedData,
        socket: systemState.socket
    };
    
    res.json({
        success: true,
        state: stateToSend
    });
});

// API pour simuler un don via REST
centralApp.post('/api/donate', (req, res) => {
    const amount = parseInt(req.body.amount) || 20;
    const donor = req.body.donor || 'Anonyme';
    const message = req.body.message || '';
    
    // Créer l'objet de donation
    const donation = {
        type: 'donation',
        username: donor,
        amount: amount,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Traiter le don
    processDonation(donation);
    
    const unifiedData = dataManager.getUnifiedData();
    
    res.json({
        success: true,
        donation: donation,
        totalDonations: unifiedData.donations.total
    });
});

// API pour déclencher un événement spécifique
centralApp.post('/api/trigger-event', (req, res) => {
    try {
        const { eventIndex } = req.body;
        const unifiedData = dataManager.getUnifiedData();
        
        if (eventIndex === undefined) {
            return res.status(400).json({
                success: false,
                error: 'L\'index de l\'événement est requis'
            });
        }
        
        // Vérifier que l'événement existe
        if (!unifiedData.story.savedEvents || !unifiedData.story.savedEvents[eventIndex]) {
            return res.status(404).json({
                success: false,
                error: 'Événement non trouvé'
            });
        }
        
        // Déterminer le seuil
        let threshold = 0;
        
        // Rechercher le seuil correspondant
        if (unifiedData.story.thresholds && unifiedData.story.thresholds.length > 0) {
            const thresholdObj = unifiedData.story.thresholds.find(t => t.eventIndex === parseInt(eventIndex));
            if (thresholdObj) {
                threshold = thresholdObj.amount;
            }
        }
        
        // Déclencher l'événement
        const success = triggerEvent(eventIndex, threshold);
        
        if (success) {
            const updatedData = dataManager.getUnifiedData();
            
            return res.json({
                success: true,
                event: updatedData.story.lastEvent
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Erreur lors du déclenchement de l\'événement'
            });
        }
    } catch (error) {
        console.error('❌ Erreur lors du déclenchement de l\'événement:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== TRAITEMENT DES ÉVÉNEMENTS =====

// Traitement d'un don
function processDonation(donation) {
    console.log(`💰 Don reçu: ${donation.amount}€ de ${donation.username}`);
    
    const unifiedData = dataManager.getUnifiedData();
    
    // Vérifier si l'authentification est déjà complète
    if (unifiedData.auth.authenticated && unifiedData.auth.progress >= unifiedData.auth.required) {
        console.log("✅ Authentification déjà complète, don enregistré sans effet sur la progression");
        
        // On met quand même à jour les donations sans affecter l'authentification
        const updatedDonations = {
            total: unifiedData.donations.total + donation.amount,
            lastDonation: donation,
            history: [...unifiedData.donations.history, donation].slice(-50) // Garder les 50 derniers
        };
        
        // Enregistrer les changements des donations seulement
        dataManager.updateUnifiedData('donations', updatedDonations);
        
        // Vérifier les paliers
        checkTiers(donation.amount);
        
        // Diffuser l'événement à tous les clients
        centralIO.emit('event', donation);
        
        // Diffuser également l'état mis à jour
        broadcastSystemState();
        
        return;
    }
    
    // Mettre à jour les donations
    const updatedDonations = {
        total: unifiedData.donations.total + donation.amount,
        lastDonation: donation,
        history: [...unifiedData.donations.history, donation].slice(-50) // Garder les 50 derniers
    };
    
    // Mettre à jour l'authentification avec un maximum (pour éviter les valeurs excessives)
    const MAX_PROGRESS = unifiedData.auth.required * 2; // Maximum = 2x la valeur requise
    const newProgress = Math.min(unifiedData.auth.progress + donation.amount, MAX_PROGRESS);
    const updatedAuth = {
        progress: newProgress,
        required: unifiedData.auth.required,
        authenticated: newProgress >= unifiedData.auth.required
    };
    
    // Enregistrer les changements
    dataManager.updateUnifiedData('donations', updatedDonations);
    dataManager.updateUnifiedData('auth', updatedAuth);
    
    // Vérifier les seuils d'événements basés sur les donations
    checkEventThresholds(updatedDonations.total);
    
    // Vérifier les paliers
    checkTiers(donation.amount);
    
    // Diffuser l'événement à tous les clients
    centralIO.emit('event', donation);
    
    // Diffuser également l'état mis à jour
    broadcastSystemState();
    
    console.log(`🔓 Progression authentification: ${newProgress}/${unifiedData.auth.required}`);
    if (newProgress >= unifiedData.auth.required && !unifiedData.auth.authenticated) {
        console.log('🔓 Authentification déverrouillée!');
    }
}

// Vérifier les seuils d'événements basés sur les donations
function checkEventThresholds(totalAmount) {
    const unifiedData = dataManager.getUnifiedData();
    
    if (!unifiedData.story.thresholds || unifiedData.story.thresholds.length === 0) {
        console.log('⚠️ Aucun seuil d\'événement défini');
        return;
    }
    
    // Trier les seuils par montant (du plus petit au plus grand)
    const sortedThresholds = [...unifiedData.story.thresholds].sort((a, b) => a.amount - b.amount);
    
    // Vérifier quels seuils ont été atteints
    let triggeredEvents = false;
    let updatedThresholds = [...unifiedData.story.thresholds];
    
    for (const threshold of sortedThresholds) {
        if (!threshold.applied && totalAmount >= threshold.amount) {
            // Marquer ce seuil comme appliqué
            updatedThresholds = updatedThresholds.map(t => 
                t.eventIndex === threshold.eventIndex 
                    ? {...t, applied: true} 
                    : t
            );
            
            triggeredEvents = true;
            
            // Obtenir l'événement correspondant
            const event = unifiedData.story.savedEvents[threshold.eventIndex];
            if (event) {
                console.log(`🎯 Seuil atteint: ${threshold.amount}€ pour l'événement "${event.name}" (index: ${threshold.eventIndex})`);
                
                // Déclencher automatiquement l'événement
                triggerEvent(threshold.eventIndex, threshold.amount);
            } else {
                console.warn(`⚠️ Événement non trouvé pour le seuil ${threshold.amount}€ (index: ${threshold.eventIndex})`);
            }
        }
    }
    
    if (triggeredEvents) {
        // Mettre à jour les seuils
        dataManager.updateUnifiedData('story.thresholds', updatedThresholds);
    }
}

// Déclencher un événement spécifique
function triggerEvent(eventIndex, threshold) {
    try {
        const unifiedData = dataManager.getUnifiedData();
        
        // Vérifier que l'événement existe
        const event = unifiedData.story.savedEvents[eventIndex];
        if (!event) {
            console.warn(`⚠️ Événement non trouvé à l'index ${eventIndex}`);
            return false;
        }
        
        // Créer l'objet d'événement
        const triggerEvent = {
            type: event.type || 'generic',
            name: event.name || 'Événement sans nom',
            parameters: event.params ? JSON.parse(event.params) : {},
            duration: event.duration || 0,
            timestamp: new Date().toISOString(),
            threshold: threshold || 0
        };
        
        // Si c'est une séquence, ajouter les actions de la séquence
        if (event.isSequence && event.sequence) {
            triggerEvent.sequence = event.sequence;
        }
        
        // Mettre à jour les données d'histoire
        const updatedStory = {
            lastEvent: triggerEvent,
            events: [...unifiedData.story.events, triggerEvent]
        };
        
        // Enregistrer les changements
        dataManager.updateUnifiedData('story', updatedStory);
        
        // Diffuser l'événement à tous les clients
        centralIO.emit('story_update', triggerEvent);
        
        console.log(`📖 Événement d'histoire déclenché: ${event.name} (index: ${eventIndex}, seuil: ${threshold}€)`);
        
        return true;
    } catch (error) {
        console.error('❌ Erreur lors du déclenchement de l\'événement:', error);
        return false;
    }
}

// Vérifier les paliers atteints
function checkTiers(amount) {
    const unifiedData = dataManager.getUnifiedData();
    const tiers = unifiedData.thresholds.tiers;
    const totalDonations = unifiedData.donations.total;
    
    let updatedTiers = [...tiers];
    let currentTier = unifiedData.thresholds.currentTier;
    let tiersChanged = false;
    
    for (let i = 0; i < tiers.length; i++) {
        if (!tiers[i].activated && totalDonations >= tiers[i].threshold) {
            // Palier atteint
            updatedTiers[i] = {...tiers[i], activated: true};
            currentTier = i;
            tiersChanged = true;
            
            // Notifier tous les clients
            centralIO.emit('tier_activated', {
                tier: i,
                name: tiers[i].name,
                threshold: tiers[i].threshold
            });
            
            console.log(`🏆 Palier atteint: ${tiers[i].name} (${tiers[i].threshold}€)`);
        }
    }
    
    if (tiersChanged) {
        // Mettre à jour les paliers
        dataManager.updateUnifiedData('thresholds', {
            tiers: updatedTiers,
            currentTier: currentTier
        });
    }
}

// Diffuser l'état du système à tous les clients
function broadcastSystemState() {
    const unifiedData = dataManager.getUnifiedData();
    
    // Fusionner les données dynamiques (socket) avec les données unifiées
    const stateToSend = {
        donations: unifiedData.donations,
        auth: unifiedData.auth,
        thresholds: unifiedData.thresholds,
        connectedClients: systemState.socket.totalClients,
        story: unifiedData.story,
        tiktok: unifiedData.tiktok
    };
    
    centralIO.emit('system_state', stateToSend);
}

// ===== GESTION DES CONNEXIONS SOCKET.IO CENTRALES =====

centralIO.on('connection', (socket) => {
    console.log(`🔌 Nouveau client connecté au serveur principal: ${socket.id}`);
    systemState.socket.totalClients++;
    
    // Informer le client de l'état actuel
    broadcastSystemState();
    
    // Identifier le type de client
    socket.on('register_client', (data) => {
        if (data.type === 'admin') {
            systemState.socket.adminClients.add(socket.id);
            console.log(`👨‍💼 Client administrateur enregistré: ${socket.id}`);
        } else if (data.type === 'sethos') {
            systemState.socket.sethosClients.add(socket.id);
            console.log(`🎮 Client Sethos enregistré: ${socket.id}`);
        }
    });
    
    // Écouter les demandes de simulation de don
    socket.on('simulateDonation', (data) => {
        const donation = {
            type: 'donation',
            username: data.username || 'Anonyme',
            amount: parseInt(data.amount) || 20,
            message: data.message || '',
            timestamp: new Date().toISOString()
        };
        
        // Traiter la donation
        processDonation(donation);
    });
    
    // Écouter les mises à jour de l'histoire
    socket.on('story_update', (data) => {
        try {
            if (data.action === 'triggerEvent') {
                const eventData = {
                    type: data.eventType || 'generic',
                    parameters: data.parameters || {},
                    timestamp: new Date().toISOString(),
                    threshold: data.threshold || 0
                };
                
                const unifiedData = dataManager.getUnifiedData();
                
                // Mettre à jour les données d'histoire
                const updatedStory = {
                    lastEvent: eventData,
                    events: [...unifiedData.story.events, eventData]
                };
                
                // Mettre à jour la progression
                if (data.threshold) {
                    updatedStory.progress = Math.max(unifiedData.story.progress, data.threshold);
                }
                
                // Enregistrer les changements
                dataManager.updateUnifiedData('story', updatedStory);
                
                // Diffuser l'événement à tous les clients
                centralIO.emit('story_update', eventData);
                
                console.log(`📖 Événement d'histoire déclenché: ${data.eventType}`);
            }
        } catch (error) {
            console.error('❌ Erreur lors du traitement de story_update:', error);
        }
    });
    
    // Écouter les mises à jour de l'interface admin
    socket.on('update_thresholds', (data) => {
        if (data && data.tiers) {
            // Mettre à jour les paliers
            dataManager.updateUnifiedData('thresholds', {
                tiers: data.tiers,
                requiredAmount: data.requiredAmount || 20
            });
            
            // Diffuser les changements
            broadcastSystemState();
            
            console.log('🔄 Thresholds mis à jour par l\'administrateur');
        }
    });
    
    // Écouter les actions spéciales
    socket.on('special_action', (data) => {
        // Diffuser l'action à tous les clients
        centralIO.emit('special_action', data);
        console.log(`🎬 Action spéciale: ${data.action} par ${data.source || 'Système'}`);
    });
    
    // Écouter les déconnexions
    socket.on('disconnect', () => {
        systemState.socket.totalClients--;
        
        // Retirer des ensembles appropriés
        systemState.socket.adminClients.delete(socket.id);
        systemState.socket.sethosClients.delete(socket.id);
        
        console.log(`🔌 Client déconnecté du serveur principal: ${socket.id}`);
        
        // Informer les autres clients
        broadcastSystemState();
    });
});

// ===== GESTION DU SERVEUR TIKTOK =====

// Variables pour le serveur TikTok
let recentEvents = [];
const MAX_RECENT_EVENTS = 50;

// Fonction pour traiter un événement TikTok
function processTikTokEvent(event) {
    // Ajouter l'horodatage
    event.timestamp = new Date().toISOString();
    
    // Ajouter à l'historique récent
    recentEvents.unshift(event);
    if (recentEvents.length > MAX_RECENT_EVENTS) {
        recentEvents.pop();
    }
    
    const unifiedData = dataManager.getUnifiedData();
    
    // Mettre à jour les compteurs TikTok
    const updatedTikTok = {
        eventCount: unifiedData.tiktok.eventCount + 1,
        lastEvent: event,
        connected: true
    };
    
    // Mettre à jour les statistiques spécifiques
    if (event.type === 'like') {
        updatedTikTok.likes = (unifiedData.tiktok.likes || 0) + 1;
    } else if (event.type === 'share') {
        updatedTikTok.shares = (unifiedData.tiktok.shares || 0) + 1;
    } else if (event.type === 'comment') {
        updatedTikTok.comments = (unifiedData.tiktok.comments || 0) + 1;
    } else if (event.type === 'viewer_count') {
        updatedTikTok.viewers = event.count || 0;
    }
    
    // Enregistrer les changements
    dataManager.updateUnifiedData('tiktok', updatedTikTok);
    
    // Diffuser l'événement
    tiktokIO.emit('tiktokEvent', event);
    
    // Si le mode n'est pas TikTok seulement, envoyer aussi au serveur central
    if (!isTikTokOnly) {
        centralIO.emit('tiktokEvent', event);
    }
    
    console.log(`📱 Événement TikTok traité: ${event.type}`);
    return true;
}

// Routes API pour TikTok
tiktokApp.get('/status', (req, res) => {
    const unifiedData = dataManager.getUnifiedData();
    
    res.json({
        success: true,
        status: 'running',
        eventCount: unifiedData.tiktok.eventCount,
        lastEvent: unifiedData.tiktok.lastEvent,
        uptime: process.uptime()
    });
});

tiktokApp.post('/event', (req, res) => {
    const event = req.body;
    
    if (!event || !event.type) {
        return res.status(400).json({
            success: false,
            error: 'Type d\'événement manquant'
        });
    }
    
    processTikTokEvent(event);
    
    const unifiedData = dataManager.getUnifiedData();
    
    res.json({
        success: true,
        event: event,
        eventCount: unifiedData.tiktok.eventCount
    });
});

tiktokApp.get('/events', (req, res) => {
    const unifiedData = dataManager.getUnifiedData();
    
    res.json({
        success: true,
        events: recentEvents,
        stats: {
            likes: unifiedData.tiktok.likes,
            shares: unifiedData.tiktok.shares,
            comments: unifiedData.tiktok.comments,
            viewers: unifiedData.tiktok.viewers
        }
    });
});

// Gestion des connections Socket.IO TikTok
tiktokIO.on('connection', (socket) => {
    console.log(`🔌 Nouveau client connecté au serveur TikTok: ${socket.id}`);
    
    const unifiedData = dataManager.getUnifiedData();
    
    // Mettre à jour l'état de connexion TikTok
    dataManager.updateUnifiedData('tiktok.connected', true);
    
    // Envoyer les statistiques actuelles
    socket.emit('tiktok_stats', {
        likes: unifiedData.tiktok.likes,
        shares: unifiedData.tiktok.shares,
        comments: unifiedData.tiktok.comments,
        viewers: unifiedData.tiktok.viewers,
        recentEvents: recentEvents.slice(0, 10)
    });
    
    // Écouter les événements TikTok manuels
    socket.on('tiktokEvent', (data) => {
        processTikTokEvent(data);
    });
    
    socket.on('disconnect', () => {
        console.log(`🔌 Client déconnecté du serveur TikTok: ${socket.id}`);
        
        // Vérifier s'il reste des clients
        if (tiktokIO.sockets.sockets.size === 0) {
            dataManager.updateUnifiedData('tiktok.connected', false);
        }
    });
});

// Simulation périodique d'événements TikTok pour plus d'interactivité
setInterval(() => {
    if (tiktokIO.sockets.sockets.size > 0) {  // Uniquement si des clients TikTok sont connectés
        const events = [
            { type: 'like', username: 'Utilisateur' + Math.floor(Math.random() * 1000) },
            { type: 'follow', username: 'Suiveur' + Math.floor(Math.random() * 500) },
            { type: 'share', username: 'Partageur' + Math.floor(Math.random() * 200) }
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        processTikTokEvent(randomEvent);
    }
}, 30000); // Toutes les 30 secondes

// ===== DÉMARRAGE DES SERVEURS =====

// Initialisation - Charger les données existantes
dataManager.initDataManager();

// Fonction pour afficher un message ASCII au démarrage
function showStartupBanner(mode) {
    const banner = mode === 'full' ? 
`
  _____  ______ _______ _    _  ____   _____           _____ 
 / ____|/ ____|__   __| |  | |/ __ \\ / ____|    /\\   |_   _|
| (___ | |       | |  | |__| | |  | | (___     /  \\    | |  
 \\___ \\| |       | |  |  __  | |  | |\\___ \\   / /\\ \\   | |  
 ____) | |____   | |  | |  | | |__| |____) | / ____ \\ _| |_ 
|_____/ \\_____|  |_|  |_|  |_|\\____/|_____/ /_/    \\_\\_____|
                                                             
               SYSTÈME UNIFIÉ v1.0                      
` : 
`
 _______ _____ _  _______ ____  _  __
|__   __|_   _| |/ /_   _/ __ \\| |/ /
   | |    | | | ' /  | || |  | | ' / 
   | |    | | |  <   | || |  | |  <  
   | |   _| |_| . \ _| || |__| | . \\ 
   |_|  |_____|_|\\_\\_____\\____/|_|\\_\\
                                      
         SERVEUR TIKTOK v1.0        
`;

    console.log(banner);
}

// Démarrer les serveurs en fonction du mode
if (isTikTokOnly) {
    // Mode TikTok seulement - démarrer uniquement le serveur TikTok
    showStartupBanner('tiktok');
    tiktokServer.listen(TIKTOK_PORT, () => {
        console.log(`📱 Serveur TikTok démarré en mode autonome sur http://localhost:${TIKTOK_PORT}`);
    });
} else {
    // Mode complet - démarrer les deux serveurs
    showStartupBanner('full');
    centralServer.listen(CENTRAL_PORT, () => {
        console.log(`🚀 Serveur central unifié démarré sur http://localhost:${CENTRAL_PORT}`);
    });
    
    tiktokServer.listen(TIKTOK_PORT, () => {
        console.log(`📱 Serveur TikTok unifié démarré sur http://localhost:${TIKTOK_PORT}`);
    });
}

// Exporter les serveurs pour utilisation externe
module.exports = {
    centralServer,
    tiktokServer,
    systemState,
    dataManager
}; 