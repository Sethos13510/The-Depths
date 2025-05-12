/**
 * Unified Threshold Validator for Sethos AI
 * Module spécialisé pour la validation et la correction des seuils d'événements
 */

(function() {
    console.log("🔄 Initialisation du module de validation des seuils...");
    
    /**
     * Fonction principale pour réparer les seuils d'un objet storyData
     * @param {Object} storyData L'objet contenant les données de l'histoire
     * @returns {Object} L'objet storyData réparé
     */
    window.validateAndFixThresholds = function(storyData) {
        if (!storyData) return null;
        
        // Vérifier si les thresholds existent et sont un tableau
        if (!storyData.thresholds || !Array.isArray(storyData.thresholds)) {
            console.log("🔧 Création d'un tableau de seuils vide");
            storyData.thresholds = [];
        }
        
        // Récupérer les événements
        const events = storyData.savedEvents || storyData.events || [];
        
        // Si nous avons des événements mais pas de seuils, créer les seuils
        if (Array.isArray(events) && events.length > 0 && storyData.thresholds.length === 0) {
            console.log("🛠️ Création de seuils pour les événements existants");
            
            // Cas spéciaux pour les événements importants
            const specialThresholds = {
                0: 10,   // Premier événement - System_Login
                1: 20,   // Access_Granted
                2: 30,   // System_Welcome
                38: 2200 // Admin_Alert
            };
            
            // Créer un seuil pour chaque événement
            events.forEach((event, index) => {
                // Déterminer le montant du seuil
                let amount;
                if (specialThresholds[index] !== undefined) {
                    amount = specialThresholds[index];
                } else {
                    const baseAmount = 50;
                    const step = 25;
                    amount = baseAmount + (index * step);
                }
                
                // Ajouter au tableau des seuils
                storyData.thresholds.push({
                    eventIndex: index,
                    amount: amount,
                    eventName: event.name || `Event_${index}`,
                    applied: false
                });
            });
        }
        
        // Corriger les problèmes courants avec les seuils existants
        if (Array.isArray(storyData.thresholds)) {
            storyData.thresholds.forEach(threshold => {
                // Assurer la présence de eventIndex
                if (threshold.eventIndex === undefined && threshold.index !== undefined) {
                    threshold.eventIndex = threshold.index;
                } else if (threshold.eventIndex === undefined) {
                    threshold.eventIndex = 0;
                }
                
                // Assurer la présence et le format correct de amount
                if (threshold.amount === undefined && threshold.value !== undefined) {
                    threshold.amount = threshold.value;
                } else if (threshold.amount === undefined) {
                    threshold.amount = 10; // Valeur par défaut
                }
                
                // Convertir amount de chaîne en nombre si nécessaire
                if (typeof threshold.amount === 'string') {
                    // Extraire les chiffres (ex: "10€" -> 10)
                    threshold.amount = parseInt(threshold.amount.replace(/[^0-9]/g, '')) || 10;
                }
                
                // Assurer la présence de eventName
                if (!threshold.eventName && events[threshold.eventIndex]) {
                    threshold.eventName = events[threshold.eventIndex].name || `Event_${threshold.eventIndex}`;
                } else if (!threshold.eventName) {
                    threshold.eventName = `Event_${threshold.eventIndex}`;
                }
                
                // Assurer la présence de applied
                if (threshold.applied === undefined) {
                    threshold.applied = false;
                }
            });
        }
        
        // Mettre à jour les compteurs
        storyData.thresholdsCount = storyData.thresholds.length;
        storyData.savedEventsCount = events.length;
        
        console.log(`✅ Validation terminée: ${storyData.thresholds.length} seuils vérifiés`);
        
        return storyData;
    };
    
    /**
     * Fonction d'aide pour la validation d'un seuil individuel
     * @param {Object} threshold Le seuil à valider
     * @returns {Boolean} true si le seuil est valide, false sinon
     */
    window.validateThreshold = function(threshold) {
        if (!threshold) return false;
        
        // Réparer le seuil d'abord
        if (typeof threshold.amount === 'string') {
            threshold.amount = parseInt(threshold.amount.replace(/[^0-9]/g, '')) || 10;
        }
        
        // Assurer que les propriétés requises existent
        if (threshold.eventIndex === undefined) threshold.eventIndex = 0;
        if (threshold.amount === undefined) threshold.amount = 10;
        if (threshold.applied === undefined) threshold.applied = false;
        if (!threshold.eventName) threshold.eventName = `Event_${threshold.eventIndex}`;
        
        // Un seuil est valide s'il a un index et un montant
        return (
            threshold.eventIndex !== undefined && 
            threshold.amount !== undefined &&
            !isNaN(threshold.amount)
        );
    };
    
    /**
     * Fonction utilitaire accessible depuis la console
     */
    window.fixThresholds = function() {
        if (window.storyData) {
            console.log("🔧 Application manuelle du correctif de seuils...");
            window.storyData = window.validateAndFixThresholds(window.storyData);
            console.log("✅ Seuils réparés avec succès");
            return true;
        }
        console.log("❌ Aucune donnée storyData trouvée");
        return false;
    };
    
    // Initialisation: attacher aux événements
    document.addEventListener('DOMContentLoaded', function() {
        console.log("🔄 Module de validation des seuils chargé et prêt");
        
        // Tenter de corriger les seuils après un court délai
        setTimeout(function() {
            if (window.storyData) {
                window.storyData = window.validateAndFixThresholds(window.storyData);
            }
            
            // Écouter les changements d'événements pour appliquer la validation
            document.addEventListener('storyDataUpdated', function(e) {
                if (e.detail && e.detail.storyData) {
                    e.detail.storyData = window.validateAndFixThresholds(e.detail.storyData);
                }
            });
        }, 1000);
    });
    
    // Appliquer immédiatement si le DOM est déjà chargé
    if (document.readyState !== 'loading') {
        if (window.storyData) {
            window.storyData = window.validateAndFixThresholds(window.storyData);
        }
    }
    
    // Intercepter les appels fetch pour corriger les données au chargement
    const originalFetch = window.fetch;
    window.fetch = async function(resource, init) {
        const response = await originalFetch(resource, init);
        
        // Vérifier si c'est une ressource qui pourrait contenir des données d'histoire
        if (resource && typeof resource === 'string' && 
            (resource.includes('/api/story/load') || 
             resource.includes('event.json') || 
             resource.includes('story_data'))) {
            
            try {
                // Cloner la réponse pour pouvoir la lire sans la consommer
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();
                
                // Vérifier si les données contiennent des éléments d'histoire
                if (data && (data.savedEvents || data.events || data.thresholds)) {
                    // Appliquer la validation
                    const fixedData = window.validateAndFixThresholds(data);
                    
                    // Retourner une nouvelle réponse avec les données corrigées
                    return new Response(JSON.stringify(fixedData), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la validation des données:", error);
            }
        }
        
        return response;
    };
    
    console.log("✅ Module de validation des seuils installé");
})();
