// Gestionnaire des événements de scénario
function setupStoryEventHandlers() {
    console.log('🟣 SETHOS - Initialisation des gestionnaires d\'événements de scénario');
    
    // Écouter les événements de l'interface admin
    window.addEventListener('message', function(event) {
        // Vérifier si c'est un message du panneau admin
        if (event.data && event.data.type === 'story_update') {
            const data = event.data.data;
            console.log('🟣 SETHOS - Mise à jour de scénario reçue via postMessage:', data);
            
            // Traiter les différents types de mises à jour
            switch (data.action) {
                case 'changeChapter':
                    handleChapterChange(data.chapter);
                    break;
                case 'showMedia':
                    handleShowMedia(data.media);
                    break;
                case 'triggerEvent':
                    if (data.isSequence) {
                        // Traiter une séquence d'événements
                        console.log('🟣 SETHOS - Traitement d\'une séquence d\'événements:', data.sequence);
                        handleEventSequence(data.sequence, data.threshold);
                    } else {
                        // Traiter un événement simple (compatible avec l'ancien format)
                        console.log('🟣 SETHOS - Traitement d\'un événement simple:', data.eventType);
                        handleEventTrigger(data.eventType, data.parameters, data.duration, data.threshold);
                    }
                    break;
                case 'metro_update':
                    // Traiter spécifiquement les événements de la trame métro
                    if (data.type === 'boat') {
                        console.log('🟣 SETHOS - Traitement événement bateau:', data.parameters);
                        handleBoatAction(data.parameters);
                    } else if (data.type === 'door') {
                        console.log('🟣 SETHOS - Traitement événement porte:', data.parameters);
                        handleDoorAction(data.parameters, data.duration);
                    }
                    break;
                default:
                    console.log('🟣 SETHOS - Type d\'action inconnu:', data.action);
            }
        }
        
        // Vérifier si c'est un événement de trame métro direct
        if (event.data && event.data.type === 'metro_update') {
            const data = event.data;
            console.log('🟣 SETHOS - Événement métro reçu via postMessage:', data);
            
            // Traiter selon le type d'événement métro
            if (data.type === 'boat') {
                console.log('🟣 SETHOS - Traitement événement bateau:', data);
                handleBoatAction(data);
            } else if (data.type === 'door') {
                console.log('🟣 SETHOS - Traitement événement porte:', data);
                handleDoorAction(data, data.duration);
            }
        }
    });
    
    // Vérifier périodiquement les mises à jour du serveur
    console.log('🟣 SETHOS - Configuration vérification périodique des mises à jour toutes les 5 secondes');
    setInterval(checkServerUpdates, 5000);
}

// Fonctions de gestion des événements
function handleChapterChange(chapterId) {
    console.log('Changing to chapter:', chapterId);
    // Mettre à jour l'interface pour le nouveau chapitre
    showStoryMessage(translate(`Chapitre activé: ${chapterId}`));
    
    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('system', translate(`🔖 Chapitre activé: ${chapterId}`));
    }
}

function handleShowMedia(media) {
    console.log('Showing media:', media);
    
    // Créer un conteneur pour le média
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'story-media';
    mediaContainer.style.position = 'fixed';
    mediaContainer.style.top = '50%';
    mediaContainer.style.left = '50%';
    mediaContainer.style.transform = 'translate(-50%, -50%)';
    mediaContainer.style.zIndex = '1000';
    mediaContainer.style.maxWidth = '90%';
    mediaContainer.style.maxHeight = '90%';
    mediaContainer.style.transition = 'opacity 0.5s';
    
    // Ajouter le média approprié selon son type
    switch (media.type) {
        case 'image':
            const img = document.createElement('img');
            img.src = media.path;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            mediaContainer.appendChild(img);
            break;
        case 'video':
            const video = document.createElement('video');
            video.src = media.path;
            video.controls = true;
            video.autoplay = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '100%';
            mediaContainer.appendChild(video);
            break;
        case 'audio':
            const audio = document.createElement('audio');
            audio.src = media.path;
            audio.controls = true;
            audio.autoplay = true;
            mediaContainer.appendChild(audio);
            break;
        case 'text':
            mediaContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            mediaContainer.style.padding = '20px';
            mediaContainer.style.color = media.parameters?.color || 'white';
            mediaContainer.style.fontFamily = 'monospace';
            mediaContainer.style.fontSize = '24px';
            mediaContainer.style.textAlign = 'center';
            mediaContainer.style.borderRadius = '5px';
            mediaContainer.innerHTML = media.parameters?.text || media.name;
            break;
    }
    
    // Ajouter un bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        document.body.removeChild(mediaContainer);
    };
    
    mediaContainer.appendChild(closeBtn);
    document.body.appendChild(mediaContainer);
    
    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('system', translate(`🖼️ Média affiché: ${media.name || media.type}`));
    }
}

function handleEventTrigger(eventType, parameters, duration, threshold) {
    console.log('Event triggered:', eventType, parameters);
    
    // Message de seuil si applicable
    if (threshold) {
        showStoryMessage(translate(`Seuil d'authentification de ${threshold}€ atteint!`), parameters.color);
        
        // Ajouter au journal
        if (window.addToStoryHistory) {
            window.addToStoryHistory('system', translate(`🔑 Seuil d'authentification: ${threshold}€`));
        }
    }
    
    // Traiter différents types d'événements
    switch (eventType) {
        case 'door':
            // Simuler l'ouverture/fermeture d'une porte
            const doorAction = parameters.action || 'open';
            const doorId = parameters.doorId || 'unknown';
            console.log(`Door ${doorId} ${doorAction}`);
            
            // Effet visuel de porte
            const doorEffect = document.createElement('div');
            doorEffect.style.position = 'fixed';
            doorEffect.style.top = '0';
            doorEffect.style.left = '0';
            doorEffect.style.right = '0';
            doorEffect.style.bottom = '0';
            doorEffect.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            doorEffect.style.zIndex = '999';
            doorEffect.style.display = 'flex';
            doorEffect.style.alignItems = 'center';
            doorEffect.style.justifyContent = 'center';
            doorEffect.innerHTML = `<div style="font-size: 36px; color: white; font-family: monospace;">PORTE ${doorAction === 'open' ? 'OUVERTE' : 'FERMÉE'}: ${doorId}</div>`;
            
            document.body.appendChild(doorEffect);
            
            // Supprimer après la durée spécifiée ou 3 secondes par défaut
            setTimeout(() => {
                document.body.removeChild(doorEffect);
            }, duration * 1000 || 3000);
            
            // Ajouter au journal
            if (window.addToStoryHistory) {
                window.addToStoryHistory('event', translate(`🚪 Porte ${doorAction === 'open' ? 'ouverte' : 'fermée'}: ${doorId}`));
            }
            break;
            
        case 'light':
            // Effet de clignotement de lumière
            const lightEffect = document.createElement('div');
            lightEffect.style.position = 'fixed';
            lightEffect.style.top = '0';
            lightEffect.style.left = '0';
            lightEffect.style.right = '0';
            lightEffect.style.bottom = '0';
            lightEffect.style.backgroundColor = 'white';
            lightEffect.style.zIndex = '999';
            lightEffect.style.animation = 'flicker 0.5s infinite';
            
            // Ajouter un style pour l'animation
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes flicker {
                    0% { opacity: 1; }
                    50% { opacity: 0.2; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(lightEffect);
            
            // Supprimer après la durée spécifiée ou 2 secondes par défaut
            setTimeout(() => {
                document.body.removeChild(lightEffect);
            }, duration * 1000 || 2000);
            
            // Ajouter au journal
            if (window.addToStoryHistory) {
                window.addToStoryHistory('event', translate(`💡 Lumières vacillantes`));
            }
            break;
            
        case 'sound':
            // Jouer un son
            const sound = new Audio(parameters.file || '/media/default_sound.mp3');
            sound.volume = parameters.volume || 1.0;
            sound.play().catch(err => console.error('Error playing sound:', err));
            
            // Ajouter au journal
            if (window.addToStoryHistory) {
                window.addToStoryHistory('event', translate(`🔊 Son joué: ${parameters.file || "Son système"}`));
            }
            break;
            
        case 'message':
            // Afficher un message
            showStoryMessage(translate(parameters.text || 'Notification système'), parameters.color);
            
            // Ajouter au journal
            if (window.addToStoryHistory) {
                window.addToStoryHistory('message', translate(`📜 ${parameters.text || "Notification système"}`));
            }
            break;
            
        case 'custom':
            // Code personnalisé
            console.log('Custom event with parameters:', parameters);
            try {
                // Exécuter du code personnalisé (avec précaution dans une application réelle)
                if (parameters.code) {
                    eval(parameters.code);
                }
            } catch (error) {
                console.error('Error executing custom event:', error);
            }
            
            // Ajouter au journal
            if (window.addToStoryHistory && parameters.description) {
                window.addToStoryHistory('custom', translate(`⚙️ ${parameters.description || "Événement personnalisé"}`));
            }
            break;
    }
}

// Afficher un message dans l'interface
function showStoryMessage(message, color = '#ff9900') {
    const messageElement = document.createElement('div');
    messageElement.className = 'story-message';
    messageElement.innerHTML = message;
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = color;
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.fontFamily = 'monospace';
    messageElement.style.fontSize = '18px';
    messageElement.style.textAlign = 'center';
    messageElement.style.zIndex = '1000';
    messageElement.style.transition = 'opacity 0.5s';
    
    document.body.appendChild(messageElement);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, 5000);
}

// Vérifier les mises à jour du serveur
function checkServerUpdates() {
    console.log('🟣 SETHOS - Vérification des mises à jour du serveur...');
    
    // Ajouter timestamp pour éviter la mise en cache
    const timestamp = Date.now();
    const url = `/api/story/updates?t=${timestamp}`;
    
    console.log('🟣 SETHOS - Envoi requête vers:', url);
    
    // Ajouter un timeout pour éviter les requêtes bloquées
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    fetch(url, { 
        signal: controller.signal,
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    })
        .then(response => {
            clearTimeout(timeoutId);
            console.log('🟣 SETHOS - Réponse reçue, status:', response.status);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('🟣 SETHOS - Données reçues:', JSON.stringify(data));
            
            if (data.success && data.updates && data.updates.length > 0) {
                console.log('🟣 SETHOS - Mises à jour reçues du serveur:', data.updates.length, 'événements');
                
                try {
                    // Traiter les mises à jour une par une avec gestion d'erreurs individuelle
                data.updates.forEach((update, idx) => {
                    console.log('🟣 SETHOS - Update #'+idx+':', JSON.stringify(update));
                        try {
                            processUpdate(update);
                        } catch (err) {
                            console.error('🔴 SETHOS - Erreur lors du traitement de la mise à jour #' + idx + ':', err);
                        }
                    });
                    console.log('🟣 SETHOS - Toutes les mises à jour ont été traitées avec succès');
                } catch (err) {
                    console.error('🔴 SETHOS - Erreur globale lors du traitement des mises à jour:', err);
                }
            } else {
                console.log('🟣 SETHOS - Aucune mise à jour disponible');
            }
        })
        .catch(err => {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                console.error('🔴 SETHOS - Requête annulée après délai d\'attente dépassé');
            } else {
                console.error('🔴 SETHOS - Erreur lors de la vérification des mises à jour:', err);
            }
        })
        .finally(() => {
            // Planifier la prochaine vérification après 1 seconde, même en cas d'erreur
            setTimeout(() => {
                // Vérifier si une autre vérification n'est pas déjà prévue
                if (!window.pendingUpdateCheck) {
                    window.pendingUpdateCheck = true;
                    setTimeout(() => {
                        window.pendingUpdateCheck = false;
                        checkServerUpdates();
                    }, 4000);
                }
            }, 1000);
        });
}

// Fonction séparée pour traiter un seul événement
function processUpdate(update) {
                    console.log('🟣 SETHOS - Traitement de la mise à jour:', update);
                    
                    switch (update.action) {
                        case 'changeChapter':
                            handleChapterChange(update.chapter);
                            break;
                        case 'showMedia':
                            handleShowMedia(update.media);
                            break;
                        case 'triggerEvent':
                            if (update.isSequence) {
                                // Traiter une séquence d'événements
                                handleEventSequence(update.sequence, update.threshold);
                            } else {
                                // Traiter un événement simple
                                handleEventTrigger(update.eventType, update.parameters, update.duration, update.threshold);
                                
                                // Traitement spécial pour les événements de la trame métro
                                if (update.eventType === 'boat') {
                                    console.log('🟣 SETHOS - Traitement événement bateau:', update.parameters);
                                    handleBoatAction(update.parameters);
                                } else if (update.eventType === 'door') {
                                    console.log('🟣 SETHOS - Traitement événement porte:', update.parameters);
                                    handleDoorAction(update.parameters, update.duration);
                                }
                            }
                            break;
                        case 'metro_update':
                            // Traiter spécifiquement les événements de la trame métro
                            if (update.type === 'boat') {
                                console.log('🟣 SETHOS - Traitement événement bateau:', update);
                                handleBoatAction(update);
                            } else if (update.type === 'door') {
                                console.log('🟣 SETHOS - Traitement événement porte:', update);
                                handleDoorAction(update, update.duration);
                            }
                            break;
                        default:
                            console.log('🟣 SETHOS - Type d\'action inconnu:', update.action);
                    }
}

// Fonction pour gérer une séquence d'événements
async function handleEventSequence(sequence, threshold) {
    console.log('🟣 SETHOS - Event sequence triggered. Threshold:', threshold, 'Sequence:', JSON.stringify(sequence));
    
    // Message de seuil si applicable
    if (threshold) {
        showStoryMessage(translate(`Seuil d'authentification de ${threshold}€ atteint!`));
        
        // Ajouter au journal
        if (window.addToStoryHistory) {
            window.addToStoryHistory('system', translate(`🔑 Seuil d'authentification: ${threshold}€`));
        }
    }
    
    // Vérifier que sequence est un tableau valide
    if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
        console.error('🟣 SETHOS - ERREUR: La séquence est invalide ou vide:', sequence);
        // Afficher un message d'erreur visible pour l'utilisateur
        showStoryMessage("Erreur: Séquence d'événements invalide", "#ff0000");
        return;
    }
    
    console.log('🟣 SETHOS - Traitement de', sequence.length, 'actions dans la séquence');
    
    // Exécuter chaque action de la séquence dans l'ordre
    for (let i = 0; i < sequence.length; i++) {
        const action = sequence[i];
        console.log('🟣 SETHOS - Traitement action #', i + 1, ':', action);
        
        // Vérifier si l'action est valide
        if (!action || !action.type) {
            console.error('🟣 SETHOS - ERREUR: Action invalide à l\'index', i, ':', action);
            continue; // Passer à l'action suivante
        }
        
        // Vérifier si c'est une pause
        if (action.type === 'pause') {
            await new Promise(resolve => setTimeout(resolve, action.duration * 1000));
            continue;
        }
        
        // Exécuter l'action en fonction de son type
        try {
            switch (action.type) {
                case 'door':
                    await handleDoorAction(action.parameters, action.duration);
                    break;
                case 'sound':
                    await handleSoundAction(action.parameters);
                    break;
                case 'message':
                    await handleMessageAction(action.parameters);
                    break;
                case 'light':
                    await handleLightAction(action.parameters, action.duration);
                    break;
                case 'image':
                    await handleImageAction(action.parameters, action.duration);
                    break;
                case 'video':
                    await handleVideoAction(action.parameters);
                    break;
                case 'boat':
                    await handleBoatAction(action.parameters);
                    break;
                case 'gif':
                    await handleGifAction(action.parameters, action.duration);
                    break;
                case 'custom':
                    await handleCustomAction(action.parameters);
                    break;
                default:
                    console.log(`🟣 SETHOS - Type d'action non géré: ${action.type}`);
                    // Afficher un message pour le type non géré
                    showStoryMessage(`Type d'action non géré: ${action.type}`, "#ffcc00");
            }
        } catch (error) {
            console.error(`🟣 SETHOS - Erreur lors de l'exécution de l'action ${action.type}:`, error);
        }
        
        // Si action a une durée définie et n'est pas la dernière action, attendre la durée
        if (action.duration && action.type !== 'pause' && i < sequence.length - 1) {
            await new Promise(resolve => setTimeout(resolve, action.duration * 1000));
        }
    }
    
    console.log('🟣 SETHOS - Séquence terminée');
}

// Fonctions spécifiques pour chaque type d'action
async function handleDoorAction(parameters, duration) {
    // Simuler l'ouverture/fermeture d'une porte
    const doorAction = parameters.action || 'open';
    const doorId = parameters.doorId || 'unknown';
    console.log(`🟣 SETHOS - Porte ${doorId} ${doorAction}`);
    
    // Trouver la porte correspondante dans la scène 3D si disponible
    if (window.doors && window.doors.length > 0 && doorId !== 'unknown') {
        // Essayer de trouver une porte par ID ou prendre la première disponible
        let targetDoor = window.doors.find(door => door.userData && door.userData.doorNumber === parseInt(doorId));
        
        // Si on trouve une porte, l'animer
        if (targetDoor && typeof window.animateDoor === 'function') {
            console.log(`🟣 SETHOS - Animation de la porte ${doorId}`);
            window.animateDoor(targetDoor);
        }
    }
    
    // Effet visuel de porte (fallback si l'animation 3D ne fonctionne pas)
    const doorEffect = document.createElement('div');
    doorEffect.style.position = 'fixed';
    doorEffect.style.top = '0';
    doorEffect.style.left = '0';
    doorEffect.style.right = '0';
    doorEffect.style.bottom = '0';
    doorEffect.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    doorEffect.style.zIndex = '999';
    doorEffect.style.display = 'flex';
    doorEffect.style.alignItems = 'center';
    doorEffect.style.justifyContent = 'center';
    doorEffect.innerHTML = `<div style="font-size: 36px; color: white; font-family: monospace;">PORTE ${doorAction === 'open' ? 'OUVERTE' : 'FERMÉE'}: ${doorId}</div>`;
    
    document.body.appendChild(doorEffect);
    
    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('event', translate(`🚪 Porte ${doorAction === 'open' ? 'ouverte' : 'fermée'}: ${doorId}`));
    }
    
    // Retirer l'effet après une durée
    setTimeout(() => {
        if (doorEffect.parentNode) {
            document.body.removeChild(doorEffect);
        }
    }, (duration || 3) * 1000);
    
    return Promise.resolve();
}

async function handleSoundAction(parameters) {
    // Jouer un son
    const sound = new Audio(parameters.file || '/media/default_sound.mp3');
    sound.volume = parameters.volume || 1.0;
    
    try {
        await sound.play();
        
        // Ajouter au journal
        if (window.addToStoryHistory) {
            window.addToStoryHistory('event', translate(`🔊 Son joué: ${parameters.file || "Son système"}`));
        }
        
        // Retourner une promesse qui se résout lorsque le son est terminé
        return new Promise(resolve => {
            sound.onended = resolve;
        });
    } catch (err) {
        console.error('Error playing sound:', err);
        return Promise.resolve(); // Continuer même en cas d'erreur
    }
}

async function handleMessageAction(parameters) {
    // Afficher le message à l'écran
    showStoryMessage(translate(parameters.text || 'Notification système'), parameters.color);
    
    // Ajouter au journal seulement si l'option skipHistory n'est pas activée
    if (window.addToStoryHistory && !parameters.skipHistory) {
        // Format du message pour l'historique
        const messageContent = translate(`${parameters.text || "Notification système"}`);
        
        // Vérifier si le message existe déjà dans l'historique récent pour éviter les doublons
        const isDuplicate = window.storyHistory && window.storyHistory.some(entry => 
            entry.content === messageContent && 
            (Date.now() - entry.rawTimestamp) < 5000 // 5 secondes pour éviter les doublons
        );
        
        // N'ajouter au journal que si ce n'est pas un doublon
        if (!isDuplicate) {
            console.log('🟣 SETHOS - Ajout au journal:', messageContent);
            
            // On utilise setTimeout pour éviter les mises à jour trop rapprochées qui perturbent l'UI
            setTimeout(() => {
                window.addToStoryHistory('message', messageContent);
            }, 100);
        } else {
            console.log('🟣 SETHOS - Message ignoré (doublon):', messageContent);
        }
    }
    
    return Promise.resolve();
}

async function handleLightAction(parameters, duration) {
    // Effets de lumière 3D intégrés au jeu
    const color = parameters.color || '#ffffff';
    const opacity = parameters.opacity !== undefined ? parameters.opacity : 1;
    const effect = parameters.effect || 'static';
    const pattern = parameters.pattern || 'static';
    const d = duration || 2;

    // Utiliser les fonctions du moteur 3D si elles existent
    if (window.flickerLights && effect === 'flicker') {
        window.flickerLights(opacity); // Utilise l'opacité comme intensité
    } else if (window.pulseLightEffect && effect === 'pulse') {
        // Convertir la couleur hex ou string en nombre
        let colorNum = typeof color === 'string' && color.startsWith('#') ? parseInt(color.replace('#',''), 16) : color;
        window.pulseLightEffect(colorNum, 3, d * 1000 / 3);
    } else if (window.flashLightEffect && effect === 'halo') {
        let colorNum = typeof color === 'string' && color.startsWith('#') ? parseInt(color.replace('#',''), 16) : color;
        window.flashLightEffect(colorNum, d * 1000);
    } else if (window.scene && effect === 'static') {
        // Appliquer la couleur et l'opacité à toutes les lumières de la scène
        window.scene.traverse(obj => {
            if (obj instanceof THREE.Light) {
                if (color) obj.color = new THREE.Color(color);
                if (opacity !== undefined) obj.intensity = opacity;
            }
        });
        setTimeout(() => {
            // Rétablir l'intensité après la durée
            window.scene.traverse(obj => {
                if (obj instanceof THREE.Light) {
                    obj.intensity = 1;
                }
            });
        }, d * 1000);
    } else {
        // Fallback : effet overlay HTML (ancien comportement)
        const lightEffect = document.createElement('div');
        lightEffect.style.position = 'fixed';
        lightEffect.style.top = '0';
        lightEffect.style.left = '0';
        lightEffect.style.right = '0';
        lightEffect.style.bottom = '0';
        lightEffect.style.backgroundColor = color;
        lightEffect.style.opacity = opacity;
        lightEffect.style.zIndex = '999';
        document.body.appendChild(lightEffect);
        setTimeout(() => {
            if (lightEffect.parentNode) document.body.removeChild(lightEffect);
        }, d * 1000);
    }

    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('event', translate(`💡 Lumière (${effect})`));
    }

    return new Promise(resolve => setTimeout(resolve, d * 1000));
}

async function handleImageAction(parameters, duration) {
    // Afficher une image
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'story-media';
    mediaContainer.style.position = 'fixed';
    mediaContainer.style.top = '50%';
    mediaContainer.style.left = '50%';
    mediaContainer.style.transform = 'translate(-50%, -50%)';
    mediaContainer.style.zIndex = '1000';
    mediaContainer.style.maxWidth = '90%';
    mediaContainer.style.maxHeight = '90%';
    mediaContainer.style.transition = 'opacity 1s ease';
    mediaContainer.style.opacity = '0';
    
    const img = document.createElement('img');
    img.src = parameters.file;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    mediaContainer.appendChild(img);
    
    // Ajouter un bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        // Ajouter un fondu de sortie avant de supprimer
        mediaContainer.style.opacity = '0';
        setTimeout(() => {
            if (mediaContainer.parentNode) {
                document.body.removeChild(mediaContainer);
            }
        }, 1000);
    };
    
    mediaContainer.appendChild(closeBtn);
    document.body.appendChild(mediaContainer);
    
    // Déclencher le fondu d'entrée
    setTimeout(() => {
        mediaContainer.style.opacity = '1';
    }, 10);
    
    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('system', translate(`🖼️ Image affichée: ${parameters.file}`));
    }
    
    // Si durée spécifiée, fermer après la durée avec effet de fondu
    if (duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Fondu de sortie
                mediaContainer.style.opacity = '0';
                
                // Attendre la fin du fondu avant de supprimer
                setTimeout(() => {
                    if (mediaContainer.parentNode) {
                        document.body.removeChild(mediaContainer);
                    }
                    resolve();
                }, 1000);
            }, duration * 1000);
        });
    }
    
    return Promise.resolve();
}

async function handleVideoAction(parameters) {
    // Afficher une vidéo
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'story-media';
    mediaContainer.style.position = 'fixed';
    mediaContainer.style.top = '50%';
    mediaContainer.style.left = '50%';
    mediaContainer.style.transform = 'translate(-50%, -50%)';
    mediaContainer.style.zIndex = '1000';
    mediaContainer.style.maxWidth = '90%';
    mediaContainer.style.maxHeight = '90%';
    mediaContainer.style.transition = 'opacity 0.5s';
    
    const video = document.createElement('video');
    video.src = parameters.file;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '100%';
    mediaContainer.appendChild(video);
    
    // Ajouter un bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        document.body.removeChild(mediaContainer);
    };
    
    mediaContainer.appendChild(closeBtn);
    document.body.appendChild(mediaContainer);
    
    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('system', translate(`🎬 Vidéo affichée: ${parameters.file}`));
    }
    
    // Retourner une promesse qui se résout lorsque la vidéo est terminée
    return new Promise(resolve => {
        video.onended = () => {
            if (parameters.autoClose && mediaContainer.parentNode) {
                document.body.removeChild(mediaContainer);
            }
            resolve();
        };
    });
}

async function handleBoatAction(parameters) {
    // Gérer les actions du bateau (arrêt, mouvement, etc.)
    const action = parameters.action || 'stop';

    // Action sur le bateau via la fenêtre parent (si disponible)
    if (window.parent) {
        window.parent.postMessage({
            type: 'boat_control',
            action: action,
            parameters: parameters
        }, '*');
    }

    // Action directe sur le bateau si on est dans la fenêtre principale
    if (action === 'stop' && typeof window.boatSpeed !== 'undefined') {
        console.log('🟣 SETHOS - Arrêt du bateau');
        window.boatSpeed = 0;
    } else if (action === 'move' && typeof window.boatSpeed !== 'undefined') {
        console.log('🟣 SETHOS - Déplacement du bateau');
        const speed = parameters.speed || 5;
        window.boatSpeed = speed / 100; // Convertir en vitesse appropriée pour Three.js
    }

    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('event', translate(`⛵ Bateau: ${action}`));
    }

    return Promise.resolve();
}

async function handleGifAction(parameters, duration) {
    // Afficher un GIF
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'story-media';
    mediaContainer.style.position = 'fixed';
    mediaContainer.style.top = '50%';
    mediaContainer.style.left = '50%';
    mediaContainer.style.transform = 'translate(-50%, -50%)';
    mediaContainer.style.zIndex = '1000';
    mediaContainer.style.maxWidth = '90%';
    mediaContainer.style.maxHeight = '90%';
    mediaContainer.style.transition = 'opacity 1s ease';
    mediaContainer.style.opacity = '0';
    
    const img = document.createElement('img');
    img.src = parameters.file;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    mediaContainer.appendChild(img);
    
    // Ajouter un bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeBtn.style.color = 'white';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '50%';
    closeBtn.style.width = '30px';
    closeBtn.style.height = '30px';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = function() {
        // Ajouter un fondu de sortie avant de supprimer
        mediaContainer.style.opacity = '0';
        setTimeout(() => {
            if (mediaContainer.parentNode) {
                document.body.removeChild(mediaContainer);
            }
        }, 1000);
    };
    
    mediaContainer.appendChild(closeBtn);
    document.body.appendChild(mediaContainer);
    
    // Déclencher le fondu d'entrée
    setTimeout(() => {
        mediaContainer.style.opacity = '1';
    }, 10);
    
    // Ajouter au journal
    if (window.addToStoryHistory) {
        window.addToStoryHistory('system', translate(`🎞️ GIF affiché: ${parameters.file}`));
    }
    
    // Si durée spécifiée, fermer après la durée avec effet de fondu
    if (duration) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Fondu de sortie
                mediaContainer.style.opacity = '0';
                
                // Attendre la fin du fondu avant de supprimer
                setTimeout(() => {
                    if (mediaContainer.parentNode) {
                        document.body.removeChild(mediaContainer);
                    }
                    resolve();
                }, 1000);
            }, duration * 1000);
        });
    }
    
    return Promise.resolve();
}

async function handleCustomAction(parameters) {
    console.log('Custom event with parameters:', parameters);
    try {
        // Exécuter du code personnalisé (avec précaution dans une application réelle)
        if (parameters.code) {
            eval(parameters.code);
        }
        
        // Ajouter au journal
        if (window.addToStoryHistory && parameters.description) {
            window.addToStoryHistory('custom', translate(`⚙️ ${parameters.description || "Événement personnalisé"}`));
        }
    } catch (error) {
        console.error('Error executing custom event:', error);
    }
    
    return Promise.resolve();
}

// Fonction utilitaire pour la traduction (simple passthrough si pas implémentée)
function translate(text) {
    // Si une fonction de traduction existe, l'utiliser
    if (typeof window.translate === 'function') {
        return window.translate(text);
    }
    
    // Sinon, retourner le texte tel quel
    return text;
}

// Initialiser les gestionnaires d'événements au chargement du document
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les gestionnaires d'événements
    setupStoryEventHandlers();
    
    console.log('🟣 SETHOS - Gestionnaires d\'événements story initialisés');
}); 