/**
 * Unified Data Manager for Sethos AI
 * Ce fichier fournit un gestionnaire de données unifié qui remplace
 * plusieurs fichiers JSON disparates par une structure cohérente.
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const DATA_DIR = path.join(__dirname, '..');
const UNIFIED_DATA_PATH = path.join(DATA_DIR, 'unified_data.json');
const SHARED_DATA_PATH = path.join(DATA_DIR, 'shared_data.json');
const STORY_DATA_PATH = path.join(DATA_DIR, 'story_data.json');
const STORY_EVENTS_PATH = path.join(DATA_DIR, 'story_events.json');
const TIKTOK_STORY_DATA_PATH = path.join(DATA_DIR, 'tiktok_story_data.json');
const AUTH_PROGRESS_PATH = path.join(DATA_DIR, 'latest_auth_progress.json');
const EVENT_DIR = path.join(DATA_DIR, 'event');
const EVENT_JSON_PATH = path.join(EVENT_DIR, 'event.json');

// Structure de données unifiée
let unifiedData = {
    // Données système
    system: {
        version: '1.0.0',
        lastStartup: null,
        uptime: 0
    },
    // Donations
    donations: {
        total: 0,
        history: [],
        lastDonation: null
    },
    // Authentification
    auth: {
        progress: 0,
        required: 20,
        authenticated: false
    },
    // Paliers
    thresholds: {
        tiers: [
            { name: "Tier 1", threshold: 20, activated: false },
            { name: "Tier 2", threshold: 50, activated: false },
            { name: "Tier 3", threshold: 100, activated: false }
        ],
        currentTier: 0,
        requiredAmount: 20
    },
    // Suivi de l'histoire
    story: {
        events: [],
        savedEvents: [],
        currentChapter: 0,
        lastEvent: null,
        progress: 0,
        thresholds: []
    },
    // Données TikTok
    tiktok: {
        connected: false,
        lastEvent: null,
        eventCount: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        viewers: 0
    }
};

/**
 * Initialise le gestionnaire de données en chargeant toutes les données existantes
 * et en les consolidant dans un format unifié.
 */
function initDataManager() {
    console.log('🔄 Initialisation du gestionnaire de données unifié...');
    
    // Vérifier si le fichier unifié existe déjà
    if (fs.existsSync(UNIFIED_DATA_PATH)) {
        try {
            // Charger les données unifiées existantes
            const data = fs.readFileSync(UNIFIED_DATA_PATH, 'utf8');
            unifiedData = JSON.parse(data);
            console.log('✅ Données unifiées chargées avec succès');
            return unifiedData;
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données unifiées:', error);
            // Continue with migration
        }
    }
    
    // Si le fichier unifié n'existe pas ou est corrompu, migrer les données
    console.log('🔄 Migration des données à partir des anciens fichiers...');
    migrateExistingData();
    
    return unifiedData;
}

/**
 * Migre les données des anciens fichiers vers le nouveau format unifié
 */
function migrateExistingData() {
    // Mettre à jour l'horodatage de démarrage
    unifiedData.system.lastStartup = new Date().toISOString();
    
    // Charger shared_data.json
    if (fs.existsSync(SHARED_DATA_PATH)) {
        try {
            const data = fs.readFileSync(SHARED_DATA_PATH, 'utf8');
            const sharedData = JSON.parse(data);
            
            // Migrer les données
            if (sharedData.thresholds) {
                unifiedData.thresholds = sharedData.thresholds;
            }
            
            if (sharedData.auth) {
                unifiedData.auth.progress = sharedData.auth.progress || 0;
                unifiedData.auth.authenticated = sharedData.auth.authenticated || false;
            }
            
            if (sharedData.donations) {
                unifiedData.donations.total = sharedData.donations.total || 0;
                unifiedData.donations.lastDonation = sharedData.donations.lastDonation || null;
            }
            
            if (sharedData.story) {
                unifiedData.story.currentChapter = sharedData.story.currentChapter || 0;
                unifiedData.story.lastEvent = sharedData.story.lastEvent || null;
                unifiedData.story.progress = sharedData.story.progress || 0;
            }
            
            if (sharedData.tiktok) {
                unifiedData.tiktok = {
                    ...unifiedData.tiktok,
                    ...sharedData.tiktok
                };
            }
            
            console.log('✅ Données shared_data.json migrées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la migration de shared_data.json:', error);
        }
    }
    
    // Charger story_data.json
    if (fs.existsSync(STORY_DATA_PATH)) {
        try {
            const data = fs.readFileSync(STORY_DATA_PATH, 'utf8');
            const storyData = JSON.parse(data);
            
            if (storyData.events) {
                // Fusionner avec les événements existants
                unifiedData.story.events = storyData.events;
            }
            
            console.log('✅ Données story_data.json migrées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la migration de story_data.json:', error);
        }
    }
    
    // Charger event.json
    if (fs.existsSync(EVENT_JSON_PATH)) {
        try {
            const data = fs.readFileSync(EVENT_JSON_PATH, 'utf8');
            const eventData = JSON.parse(data);
            
            if (eventData.savedEvents) {
                unifiedData.story.savedEvents = eventData.savedEvents;
                
                // Configurer les seuils pour les événements
                configureSavedEventThresholds();
            }
            
            console.log('✅ Données event.json migrées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la migration de event.json:', error);
        }
    }
    
    // Charger auth_progress.json
    if (fs.existsSync(AUTH_PROGRESS_PATH)) {
        try {
            const data = fs.readFileSync(AUTH_PROGRESS_PATH, 'utf8');
            const authData = JSON.parse(data);
            
            if (authData.progress !== undefined) {
                unifiedData.auth.progress = Math.max(unifiedData.auth.progress, authData.progress);
            }
            
            console.log('✅ Données auth_progress.json migrées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la migration de auth_progress.json:', error);
        }
    }
    
    // Sauvegarder les données unifiées
    saveUnifiedData();
}

/**
 * Configure les seuils pour les événements sauvegardés
 */
function configureSavedEventThresholds() {
    if (!unifiedData.story.savedEvents || unifiedData.story.savedEvents.length === 0) {
        return;
    }
    
    // Configurer les seuils pour les événements
    unifiedData.story.thresholds = [];
    
    console.log("⚠️ Configuration améliorée des seuils dans le DataManager...");
    
    // Valeurs spécifiques pour les événements problématiques et principaux
    const specificThresholds = {
        0: 10,    // System_Login
        1: 20,    // Access_Granted
        5: 100,   // File_Access
        10: 225,  // Unknown_Message
        15: 400,  // Subject_Records
        20: 650,  // Security_Footage
        25: 900,  // Anonymous_Request
        30: 1300, // Security_Response
        35: 1800, // System_Manipulation
        38: 2200  // Admin_Alert
    };
    
    // Générer des seuils en utilisant les valeurs spécifiques
    let eventsConfigured = 0;
    
    unifiedData.story.savedEvents.forEach((event, index) => {
        let amount;
        
        if (specificThresholds[index] !== undefined) {
            // Utiliser la valeur spécifique
            amount = specificThresholds[index];
            console.log(`   Seuil FORCÉ pour l'événement ${index} (${event.name}): ${amount}€`);
        } else {
            // Calcul par défaut pour les autres événements avec une progression exponentielle
            const eventCount = unifiedData.story.savedEvents.length;
            
            // Trouver les seuils spécifiques les plus proches (avant et après)
            let lowerIndex = 0;
            let upperIndex = eventCount - 1;
            let lowerAmount = specificThresholds[0] || 10;
            let upperAmount = specificThresholds[38] || 2200;
            
            // Rechercher les bornes spécifiques les plus proches
            Object.keys(specificThresholds).forEach(specIndex => {
                specIndex = parseInt(specIndex);
                if (specIndex < index && specIndex > lowerIndex) {
                    lowerIndex = specIndex;
                    lowerAmount = specificThresholds[specIndex];
                }
                if (specIndex > index && specIndex < upperIndex) {
                    upperIndex = specIndex;
                    upperAmount = specificThresholds[specIndex];
                }
            });
            
            // Calculer le montant proportionnel entre les bornes
            const range = upperIndex - lowerIndex;
            const position = index - lowerIndex;
            const ratio = position / range;
            amount = Math.round(lowerAmount + ratio * (upperAmount - lowerAmount));
            
            console.log(`   Seuil calculé pour l'événement ${index} (${event.name}): ${amount}€`);
        }
        
        // Ajouter le seuil à la liste
        unifiedData.story.thresholds.push({
            eventIndex: index,
            amount: amount,
            eventName: event.name || `Event_${index}`,
            applied: false
        });
        
        eventsConfigured++;
    });
    
    console.log(`✅ ${eventsConfigured} seuils configurés dans le DataManager`);
    
    // Vérification des valeurs clés pour debug
    console.log(`⭐ Vérification : Event 1 (Access_Granted) = ${unifiedData.story.thresholds.find(t => t.eventIndex === 1)?.amount}€`);
    console.log(`⭐ Vérification : Event 38 (Admin_Alert) = ${unifiedData.story.thresholds.find(t => t.eventIndex === 38)?.amount}€`);
}

/**
 * Sauvegarde les données unifiées dans le fichier
 */
function saveUnifiedData() {
    try {
        // Protection contre les sauvegardes trop fréquentes
        const currentTime = Date.now();
        if (unifiedData._lastSaveTime && currentTime - unifiedData._lastSaveTime < 2000) {
            // Si moins de 2 secondes se sont écoulées depuis la dernière sauvegarde, on ne sauvegarde pas
            return true;
        }
        
        // Mettre à jour l'uptime
        unifiedData.system.uptime = process.uptime();
        
        // Marquer l'heure de la dernière sauvegarde
        unifiedData._lastSaveTime = currentTime;
        
        // Créer une copie sans la propriété _lastSaveTime pour la sauvegarde
        const dataToSave = { ...unifiedData };
        delete dataToSave._lastSaveTime;
        
        // Sauvegarder dans le fichier unifié
        fs.writeFileSync(UNIFIED_DATA_PATH, JSON.stringify(dataToSave, null, 2), 'utf8');
        console.log('✅ Données unifiées sauvegardées avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des données unifiées:', error);
        return false;
    }
}

/**
 * Récupère les données de l'histoire
 * @returns {Object} Données d'histoire formatées
 */
function getStoryData() {
    // Retourner une structure formattée pour le client
    return {
        events: unifiedData.story.events || [],
        savedEvents: unifiedData.story.savedEvents || [],
        thresholds: unifiedData.story.thresholds || [],
        currentChapter: unifiedData.story.currentChapter || 0,
        progress: unifiedData.story.progress || 0
    };
}

/**
 * Sauvegarde les données d'histoire
 * @param {Object} storyData - Données d'histoire à sauvegarder
 */
function saveStoryData(storyData) {
    if (!storyData) {
        throw new Error('Données d\'histoire manquantes');
    }
    
    // Mettre à jour les données d'histoire
    const updatedStory = {
        ...unifiedData.story,
        events: storyData.events || unifiedData.story.events || [],
        savedEvents: storyData.savedEvents || unifiedData.story.savedEvents || [],
        thresholds: storyData.thresholds || unifiedData.story.thresholds || [],
        currentChapter: storyData.currentChapter !== undefined ? storyData.currentChapter : unifiedData.story.currentChapter
    };
    
    // Mettre à jour les données unifiées
    updateUnifiedData('story', updatedStory);
    
    // Sauvegarder également dans les anciens emplacements pour la compatibilité
    try {
        // Sauvegarder dans story_data.json
        const storyDataToSave = {
            events: updatedStory.events,
            currentChapter: updatedStory.currentChapter,
            lastUpdate: new Date().toISOString()
        };
        fs.writeFileSync(STORY_DATA_PATH, JSON.stringify(storyDataToSave, null, 4), 'utf8');
        
        // Sauvegarder dans event.json
        const eventDataToSave = {
            savedEvents: updatedStory.savedEvents,
            lastUpdate: new Date().toISOString()
        };
        
        // Créer le répertoire event s'il n'existe pas
        if (!fs.existsSync(EVENT_DIR)) {
            fs.mkdirSync(EVENT_DIR, { recursive: true });
        }
        
        fs.writeFileSync(EVENT_JSON_PATH, JSON.stringify(eventDataToSave, null, 4), 'utf8');
        
        console.log('✅ Données d\'histoire sauvegardées avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des données d\'histoire:', error);
        throw error;
    }
}

/**
 * Retourne les données unifiées (toute la structure ou une section spécifique)
 * @param {string} [section] - Section optionnelle à retourner
 * @returns {Object} Données unifiées
 */
function getUnifiedData(section) {
    if (section && unifiedData[section]) {
        return unifiedData[section];
    }
    return unifiedData;
}

/**
 * Met à jour une partie spécifique des données unifiées
 */
function updateUnifiedData(section, data) {
    if (!section || typeof section !== 'string') {
        console.error('❌ Section invalide pour la mise à jour des données');
        return false;
    }
    
    try {
        // Mise à jour par fusion
        if (section.includes('.')) {
            // Support de chemins comme "auth.progress"
            const parts = section.split('.');
            let current = unifiedData;
            
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            
            current[parts[parts.length - 1]] = data;
        } else {
            // Mise à jour de la section entière
            unifiedData[section] = {
                ...unifiedData[section],
                ...data
            };
        }
        
        // Sauvegarder après chaque mise à jour
        return saveUnifiedData();
    } catch (error) {
        console.error(`❌ Erreur lors de la mise à jour de la section ${section}:`, error);
        return false;
    }
}

// Exporter les fonctions du module
module.exports = {
    initDataManager,
    getUnifiedData,
    updateUnifiedData,
    saveUnifiedData,
    getStoryData,
    saveStoryData
}; 