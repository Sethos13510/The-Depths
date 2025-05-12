// ========== PRÉVISUALISATION DES ÉVÉNEMENTS ==========

// Variables globales pour la prévisualisation
let previewFrame;
let previewLogContent;
let previewEventBtn;
let previewResetBtn;

// Initialiser les éléments de prévisualisation lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation des éléments de prévisualisation');
    previewFrame = document.getElementById('event-preview-iframe');
    previewLogContent = document.getElementById('preview-log-content');
    previewEventBtn = document.getElementById('preview-event-btn');
    previewResetBtn = document.getElementById('preview-reset-btn');
    
    // Ajouter les écouteurs d'événements
    if (previewEventBtn) previewEventBtn.addEventListener('click', previewCurrentEvent);
    if (previewResetBtn) previewResetBtn.addEventListener('click', resetPreview);
    
    // Écouter les messages de l'iframe
    window.addEventListener('message', function(event) {
        const data = event.data;
        if (data && data.type === 'preview_log') {
            addPreviewLog(`[${data.timestamp}] ${data.message}`);
        }
    });
    
    // Initialiser l'iframe
    initPreviewFrame();
});

// Initialiser la prévisualisation
async function initPreviewFrame(parent_window) {
    // Créer une liaison avec la fenêtre parente
    window.parent = parent_window;
    
    // Configuration du prévisualiseur
    const previewContainer = document.getElementById('preview-container');
    if (!previewContainer) {
        console.error("Container de prévisualisation non trouvé");
        return;
    }
    
    // Charger Three.js depuis CDN si nécessaire
    if (typeof THREE === 'undefined') {
        await loadThreeJS();
    }
    
    // Configurez la scène 3D
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x091833); // Couleur de fond bleu foncé comme l'océan
    
    // Configurez la caméra
    const camera = new THREE.PerspectiveCamera(75, previewContainer.clientWidth / previewContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);
    
    // Configurez le renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // Log dimensions du conteneur AVANT setSize
    console.log(`🖼️ PREVIEW: Container dimensions before setSize: ${previewContainer.clientWidth} x ${previewContainer.clientHeight}`);
    
    renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    
    // Log avant suppression
    console.log("🖼️ PREVIEW: Canvas elements in #preview-container BEFORE removal:", previewContainer.querySelectorAll('canvas'));
    
    // Supprimer TOUS les canvas existants dans le conteneur
    const existingCanvases = previewContainer.querySelectorAll('canvas');
    existingCanvases.forEach(canvas => {
        console.log("🖼️ PREVIEW: Removing existing canvas:", canvas);
        previewContainer.removeChild(canvas);
    });
    
    // Log après suppression
    console.log("🖼️ PREVIEW: Canvas elements in #preview-container AFTER removal:", previewContainer.querySelectorAll('canvas'));
    
    // Ajouter le nouveau canvas du renderer
    console.log("🖼️ PREVIEW: Appending new renderer canvas.");
    previewContainer.appendChild(renderer.domElement);
    
    // Log final
    console.log("🖼️ PREVIEW: Final canvas elements in #preview-container:", previewContainer.querySelectorAll('canvas'));
    
    // Ajoutez des lumières
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Créer l'eau
    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    const waterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0077be,
        transparent: true,
        opacity: 0.8,
        metalness: 0.1,
        roughness: 0.2
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -1;
    scene.add(water);
    
    // Créer le bateau
    const boat = createBoat();
    scene.add(boat);
    
    // Créer le tunnel
    const tunnel = createTunnel();
    tunnel.position.z = -15;
    scene.add(tunnel);
    
    // Créer les portes
    const leftDoor = createDoor();
    leftDoor.position.set(-2, 0, -10);
    scene.add(leftDoor);
    
    const rightDoor = createDoor();
    rightDoor.position.set(2, 0, -10);
    scene.add(rightDoor);
    
    // Ajouter un conteneur pour les messages
    const messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    messageContainer.style.position = 'absolute';
    messageContainer.style.bottom = '20px';
    messageContainer.style.left = '0';
    messageContainer.style.width = '100%';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.color = 'white';
    messageContainer.style.fontSize = '18px';
    messageContainer.style.fontFamily = 'Arial, sans-serif';
    messageContainer.style.padding = '10px';
    messageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    messageContainer.style.display = 'none';
    previewContainer.appendChild(messageContainer);
    
    // Variables de l'état actuel
    const state = {
        boatMoving: false,
        doorsOpen: false,
        message: '',
        soundPlaying: false
    };
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Animer l'eau
        waterMaterial.displacementScale = Math.sin(Date.now() * 0.001) * 0.1;
        water.position.y = -1 + Math.sin(Date.now() * 0.0005) * 0.05;
        
        // Animer le bateau si en mouvement
        if (state.boatMoving) {
            boat.position.z -= 0.05;
            if (boat.position.z < -10) {
                state.boatMoving = false;
            }
        } else {
            // Léger mouvement de flottement
            boat.position.y = Math.sin(Date.now() * 0.001) * 0.1;
            boat.rotation.x = Math.sin(Date.now() * 0.0005) * 0.02;
            boat.rotation.z = Math.sin(Date.now() * 0.0008) * 0.02;
        }
        
        renderer.render(scene, camera);
    }
    
    // Démarre l'animation
    animate();
    
    // Fonction pour créer un bateau simple
    function createBoat() {
        const boatGroup = new THREE.Group();
        
        // Corps du bateau
        const boatGeometry = new THREE.BoxGeometry(1.5, 0.5, 3);
        const boatMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const boatBody = new THREE.Mesh(boatGeometry, boatMaterial);
        boatBody.position.y = 0;
        boatBody.castShadow = true;
        boatBody.receiveShadow = true;
        boatGroup.add(boatBody);
        
        // Cabine du bateau
        const cabinGeometry = new THREE.BoxGeometry(1, 0.7, 1);
        const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 0.6;
        cabin.position.z = 0.5;
        cabin.castShadow = true;
        boatGroup.add(cabin);
        
        return boatGroup;
    }
    
    // Fonction pour créer un tunnel
    function createTunnel() {
        const tunnelGroup = new THREE.Group();
        
        const tunnelGeometry = new THREE.CylinderGeometry(3, 3, 10, 32, 1, true);
        const tunnelMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x555555, 
            side: THREE.BackSide,
            metalness: 0.3,
            roughness: 0.8
        });
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        tunnel.rotation.x = Math.PI / 2;
        tunnelGroup.add(tunnel);
        
        return tunnelGroup;
    }
    
    // Fonction pour créer une porte
    function createDoor() {
        const doorGeometry = new THREE.BoxGeometry(1.8, 3, 0.2);
        const doorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            metalness: 0.1,
            roughness: 0.7
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.castShadow = true;
        
        return door;
    }
    
    // Fonction pour ouvrir les portes
    function openDoors() {
        if (!state.doorsOpen) {
            state.doorsOpen = true;
            
            // Animation d'ouverture
            const duration = 1000; // ms
            const startTime = Date.now();
            const leftStart = leftDoor.position.x;
            const rightStart = rightDoor.position.x;
            
            function animateDoors() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Utiliser une fonction d'easing
                const eased = easeOutQuad(progress);
                
                leftDoor.position.x = leftStart - eased * 2;
                rightDoor.position.x = rightStart + eased * 2;
                
                if (progress < 1) {
                    requestAnimationFrame(animateDoors);
                }
            }
            
            animateDoors();
        }
    }
    
    // Fonction d'easing
    function easeOutQuad(t) {
        return t * (2 - t);
    }
    
    // Fonction pour fermer les portes
    function closeDoors() {
        if (state.doorsOpen) {
            state.doorsOpen = false;
            
            // Animation de fermeture
            const duration = 1000; // ms
            const startTime = Date.now();
            const leftStart = leftDoor.position.x;
            const rightStart = rightDoor.position.x;
            const leftTarget = -2;
            const rightTarget = 2;
            
            function animateDoors() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Utiliser une fonction d'easing
                const eased = easeOutQuad(progress);
                
                leftDoor.position.x = leftStart + (leftTarget - leftStart) * eased;
                rightDoor.position.x = rightStart + (rightTarget - rightStart) * eased;
                
                if (progress < 1) {
                    requestAnimationFrame(animateDoors);
                }
            }
            
            animateDoors();
        }
    }
    
    // Fonction pour faire avancer le bateau
    function moveBoat() {
        if (!state.boatMoving) {
            state.boatMoving = true;
            boat.position.z = 5; // Position de départ
        }
    }
    
    // Fonction pour afficher un message
    function showMessage(message, duration = 3000) {
        state.message = message;
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        
        setTimeout(() => {
            messageContainer.style.display = 'none';
            state.message = '';
        }, duration);
    }
    
    // Fonction pour jouer un son
    function playSound(soundName) {
        if (state.soundPlaying) return;
        
        // Simulation de son (dans une vraie implémentation, utiliser l'API Audio)
        console.log(`Playing sound: ${soundName}`);
        state.soundPlaying = true;
        
        // Simuler la fin du son
        setTimeout(() => {
            state.soundPlaying = false;
        }, 2000);
    }
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        // Recalculer les dimensions du conteneur
        const newWidth = previewContainer.clientWidth;
        const newHeight = previewContainer.clientHeight;
        
        // Mettre à jour la caméra
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        // Mettre à jour la taille du renderer
        renderer.setSize(newWidth, newHeight);
        console.log(`🖼️ PREVIEW: Resized renderer to ${newWidth} x ${newHeight}`);
    });
    
    // Fonction pour charger Three.js dynamiquement
    async function loadThreeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // API pour le prévisualiseur
    window.previewAPI = {
        // Méthodes d'action
        moveBoat,
        openDoors,
        closeDoors,
        showMessage,
        playSound,
        
        // Pour des actions personnalisées
        executeAction: function(actionType, parameters) {
            console.log(`Executing action: ${actionType}`, parameters);
            
            switch(actionType) {
                case 'showMessage':
                    showMessage(parameters.text || 'Message par défaut');
                    break;
                    
                case 'moveBoat':
                    moveBoat();
                    break;
                    
                case 'openDoors':
                    openDoors();
                    break;
                    
                case 'closeDoors':
                    closeDoors();
                    break;
                    
                case 'playSound':
                    playSound(parameters.sound || 'default');
                    break;
                    
                default:
                    console.warn(`Action de type ${actionType} non reconnue`);
            }
            
            // Envoyer un log à la fenêtre parente
            if (window.parent && window.parent.postMessage) {
                window.parent.postMessage({
                    type: 'preview_log',
                    actionType,
                    parameters
                }, '*');
            }
        }
    };
    
    // Indiquer que le prévisualiseur est prêt
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage({ type: 'preview_ready' }, '*');
    }
    
    console.log("Prévisualiseur d'événement initialisé");
}

// Ajouter un message au journal de prévisualisation
function addPreviewLog(message, isError = false) {
    try {
        if (!previewLogContent) {
            console.error('preview-log-content not found');
            return;
        }
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry' + (isError ? ' log-error' : '');
        
        const time = new Date().toISOString().substring(11, 19);
        logEntry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-message">${message}</span>`;
        
        previewLogContent.appendChild(logEntry);
        previewLogContent.scrollTop = previewLogContent.scrollHeight;
    } catch (error) {
        console.error('Error adding preview log:', error);
    }
}

// Prévisualiser l'événement actuel
function previewCurrentEvent() {
    console.log('Prévisualisation de l\'événement actuel');
    
    try {
        // Dans la nouvelle interface, on a toujours une séquence
        // Pas besoin de vérifier event-type ou simple-event-type
        
        // Prévisualiser la séquence d'événements
        if (!window.sequenceActions || window.sequenceActions.length === 0) {
            alert('Veuillez ajouter au moins une action à la séquence');
            return;
        }
            
        const previewData = {
            isSequence: true,
            type: 'sequence',
            sequence: window.sequenceActions
        };
        
        // Préparer les actions de type boat_control pour le debug
        const boatActions = window.sequenceActions.filter(action => action.type === 'boat');
        if (boatActions.length > 0) {
            console.log('Actions bateau détectées:', boatActions);
            boatActions.forEach(boatAction => {
                console.log(`Action bateau: ${boatAction.parameters?.action || 'non spécifiée'}`);
            });
        }
        
        // Envoyer les données à l'iframe
        if (previewFrame && previewFrame.contentWindow) {
            previewFrame.contentWindow.postMessage({
                type: 'preview_event',
                event: previewData
            }, '*');
            
            addPreviewLog('Lancement de la prévisualisation');
        } else {
            console.error('Preview iframe not ready');
            addPreviewLog('Erreur: l\'iframe n\'est pas prête', true);
        }
    } catch (error) {
        console.error('Error previewing event:', error);
        addPreviewLog('Erreur lors de la prévisualisation: ' + error.message, true);
    }
}

// Réinitialiser la prévisualisation
function resetPreview() {
    console.log('Réinitialisation de la prévisualisation');
    if (previewFrame && previewFrame.contentWindow) {
        previewFrame.contentWindow.postMessage({
            type: 'reset_preview'
        }, '*');
        
        addPreviewLog('Réinitialisation de la prévisualisation');
    } else {
        console.error('Preview iframe not ready');
        addPreviewLog('Erreur: l\'iframe n\'est pas prête', true);
    }
}

// ========== FIN PRÉVISUALISATION =========
