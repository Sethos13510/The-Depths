/**
 * Improved Sequence Editor - Interface améliorée pour la gestion des actions de séquence
 */

// Fonction de secours pour playSound au cas où basic_sounds.js ne serait pas chargé
if (typeof playSound !== 'function') {
    window.playSound = function(name) {
        console.log(`Son joué (version de secours): ${name}`);
        // Créer un bip simple si basic_sounds.js n'est pas disponible
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 440; // La note A4
            g.gain.value = 0.3;
            o.connect(g).connect(ctx.destination);
            o.start();
            o.stop(ctx.currentTime + 0.2);
            o.onended = () => { o.disconnect(); g.disconnect(); };
        } catch (e) {
            console.error('Impossible de jouer le son de secours:', e);
        }
    };
}

// Styles CSS pour la nouvelle interface
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les styles CSS
    const style = document.createElement('style');
    style.textContent = `
        /* Style pour les actions de séquence */
        .sequence-action {
            background-color: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .sequence-action-content {
            display: flex;
            width: 100%;
        }
        
        .sequence-action-grip {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0,0,0,0.1);
            padding: 0 8px;
            cursor: grab;
        }
        
        .sequence-action-info {
            flex: 1;
            padding: 10px;
        }
        
        .sequence-action-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .sequence-action-title {
            display: flex;
            align-items: center;
            font-weight: bold;
        }
        
        .action-type-indicator {
            margin-right: 8px;
        }
        
        .sequence-action-duration {
            display: flex;
            align-items: center;
            background-color: rgba(0,0,0,0.1);
            border-radius: 4px;
            padding: 2px 6px;
        }
        
        .action-duration-field {
            width: 50px;
            background: transparent;
            border: none;
            color: inherit;
            text-align: right;
        }
        
        .duration-unit {
            margin-left: 2px;
        }
        
        .action-params-container {
            border-top: 1px solid var(--border-color);
            padding-top: 8px;
        }
        
        .action-param-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .action-param-display {
            flex: 1;
            font-size: 0.9em;
            color: var(--text-muted);
        }
        
        .action-control-btns {
            display: flex;
            gap: 5px;
        }
        
        .action-config-btn, .action-delete-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1em;
            padding: 3px;
            transition: all 0.2s ease;
        }
        
        .action-config-btn:hover, .action-delete-btn:hover {
            transform: scale(1.2);
        }
        
        .action-config-panel {
            margin-top: 8px;
            padding: 8px;
            background-color: rgba(0,0,0,0.05);
            border-radius: 4px;
        }
        
        /* Style pour le modal de sélection d'action */
        .action-selector-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .action-selector-modal.active {
            display: flex;
        }
        
        .action-selector-content {
            background-color: var(--background-color);
            border-radius: 8px;
            width: 80%;
            max-width: 800px;
            max-height: 80%;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .action-selector-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .action-selector-header h2 {
            margin: 0;
            color: var(--text-color);
        }
        
        .close-selector {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
            color: var(--text-muted);
        }
        
        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 15px;
            padding: 15px 0;
        }
        
        .action-grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--background-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .action-grid-item:hover {
            background-color: var(--accent-color-transparent);
            transform: translateY(-3px);
        }
        
        .action-grid-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .action-grid-label {
            font-size: 0.9em;
            font-weight: bold;
        }
        
        /* Style pour les éléments en cours de glissement */
        .sequence-action.dragging {
            opacity: 0.6;
            border: 2px dashed var(--accent-color);
        }
        
        /* Indicateurs de drop */
        .sequence-action.drop-before {
            border-top: 3px solid var(--highlight-color);
        }
        
        .sequence-action.drop-after {
            border-bottom: 3px solid var(--highlight-color);
        }
        
        /* Style pour les panneaux de configuration spécifiques */
        .config-field-group {
            margin-bottom: 10px;
        }
        
        .config-field-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .config-field-group select,
        .config-field-group input {
            width: 100%;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
        }
        
        .config-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;
        }
        
        .config-save-btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
        }
        
        /* Bouton flottant pour ajouter une action */
        .floating-add-btn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: var(--accent-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            z-index: 100;
        }
        
        .floating-add-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        /* Conteneur de séquence modifié */
        .sequence-container-wrapper {
            position: relative;
            width: 100%;
        }
        
        .sequence-container {
            width: 100%;
            height: 300px;
            overflow-y: auto;
            padding: 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background-color: var(--background-color);
        }

        /* Nouveaux styles pour le menu déroulant */
        .action-menu-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 18px;
        }
        .action-select {
            font-size: 1em;
            padding: 6px 10px;
            border-radius: 5px;
            border: 1px solid var(--border-color, #ccc);
            background: var(--background-color, #fff);
        }
        .add-action-menu-btn {
            background: var(--accent-color, #007bff);
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 1.3em;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
        }
        .add-action-menu-btn:hover {
            background: var(--highlight-color, #ff4d7a);
            transform: scale(1.12);
        }
    `;
    
    document.head.appendChild(style);
    
    // Injecter le template HTML pour le nouvel élément d'action
    const actionTemplate = document.createElement('template');
    actionTemplate.id = 'improved-action-template';
    actionTemplate.innerHTML = `
        <div class="sequence-action" data-action-id="{{id}}">
            <div class="sequence-action-content">
                <div class="sequence-action-grip">
                    <span class="action-move-handle">↕️</span>
                </div>
                <div class="sequence-action-info">
                    <div class="sequence-action-header">
                        <div class="sequence-action-title">
                            <span class="action-type-indicator">{{typeIcon}}</span>
                            <span class="action-name">{{typeName}}</span>
                        </div>
                        <div class="sequence-action-duration">
                            <input type="number" class="action-duration-field" value="{{duration}}" min="0" step="0.5" title="Durée (secondes)">
                            <span class="duration-unit">s</span>
                        </div>
                    </div>
                    <div class="sequence-action-controls">
                        <div class="action-params-container">
                            <div class="action-param-section">
                                <div class="action-param-display">{{paramSummary}}</div>
                                <div class="action-control-btns">
                                    <button type="button" class="action-config-btn" title="Configurer l'action">⚙️</button>
                                    <button type="button" class="action-delete-btn" title="Supprimer l'action">🗑️</button>
                                </div>
                            </div>
                            <div class="action-config-panel" style="display: none;">
                                <!-- Champs de configuration spécifiques insérés dynamiquement -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(actionTemplate);
    
    // Injecter le modal de sélection d'action
    const actionSelector = document.createElement('div');
    actionSelector.id = 'action-selector-modal';
    actionSelector.className = 'action-selector-modal';
    actionSelector.innerHTML = `
        <div class="action-selector-content">
            <div class="action-selector-header">
                <h2>Ajouter une action</h2>
                <button class="close-selector">&times;</button>
            </div>
            <div class="action-grid">
                <div class="action-grid-item" data-action-type="sound">
                    <div class="action-grid-icon">🔊</div>
                    <div class="action-grid-label">Son</div>
                </div>
                <div class="action-grid-item" data-action-type="message">
                    <div class="action-grid-icon">💬</div>
                    <div class="action-grid-label">Message</div>
                </div>
                <div class="action-grid-item" data-action-type="door">
                    <div class="action-grid-icon">🚪</div>
                    <div class="action-grid-label">Porte</div>
                </div>
                <div class="action-grid-item" data-action-type="light">
                    <div class="action-grid-icon">💡</div>
                    <div class="action-grid-label">Lumière</div>
                </div>
                <div class="action-grid-item" data-action-type="video">
                    <div class="action-grid-icon">🎬</div>
                    <div class="action-grid-label">Vidéo</div>
                </div>
                <div class="action-grid-item" data-action-type="image">
                    <div class="action-grid-icon">🖼️</div>
                    <div class="action-grid-label">Image</div>
                </div>
                <div class="action-grid-item" data-action-type="boat">
                    <div class="action-grid-icon">⛵</div>
                    <div class="action-grid-label">Bateau</div>
                </div>
                <div class="action-grid-item" data-action-type="gif">
                    <div class="action-grid-icon">🎞️</div>
                    <div class="action-grid-label">GIF</div>
                </div>
                <div class="action-grid-item" data-action-type="pause">
                    <div class="action-grid-icon">⏱️</div>
                    <div class="action-grid-label">Pause</div>
                </div>
                <div class="action-grid-item" data-action-type="custom">
                    <div class="action-grid-icon">🔧</div>
                    <div class="action-grid-label">Personnalisé</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(actionSelector);
    
    // --- NOUVEAU MENU DÉROULANT ---
    const sequenceActionsWrapper = document.querySelector('.sequence-container-wrapper');
    if (sequenceActionsWrapper) {
        // Supprimer l'ancienne palette et la grille intégrée
        const paletteElement = sequenceActionsWrapper.querySelector('.sequence-actions-palette');
        if (paletteElement) paletteElement.remove();
        const oldGrid = sequenceActionsWrapper.querySelector('.integrated-action-palette');
        if (oldGrid) oldGrid.remove();
        const oldFloatingBtn = sequenceActionsWrapper.querySelector('.floating-add-btn');
        if (oldFloatingBtn) oldFloatingBtn.remove();

        // Créer le menu déroulant et le bouton +
        const actionMenuContainer = document.createElement('div');
        actionMenuContainer.className = 'action-menu-container';
        actionMenuContainer.innerHTML = `
            <label for="action-select" style="margin-right:8px;">Ajouter une action :</label>
            <select id="action-select" class="action-select">
                <option value="sound">🔊 Son</option>
                <option value="message">💬 Message</option>
                <option value="door">🚪 Porte</option>
                <option value="light">💡 Lumière</option>
                <option value="video">🎬 Vidéo</option>
                <option value="image">🖼️ Image</option>
                <option value="boat">⛵ Bateau</option>
                <option value="gif">🎞️ GIF</option>
                <option value="pause">⏱️ Pause</option>
                <option value="custom">🔧 Personnalisé</option>
            </select>
            <button id="add-action-menu-btn" class="add-action-menu-btn" type="button" title="Ajouter"><span>+</span></button>
        `;
        // Ajouter le menu en haut du wrapper
        sequenceActionsWrapper.insertBefore(actionMenuContainer, sequenceActionsWrapper.firstChild);

        // Gestionnaire pour le bouton +
        actionMenuContainer.querySelector('#add-action-menu-btn').onclick = function(e) {
            // Empêcher la soumission du formulaire
            e.preventDefault();
            e.stopPropagation();
            
            const select = actionMenuContainer.querySelector('#action-select');
            const type = select.value;
            if (type) createQuickAction(type);
        };
    }

    // Supprimer le modal s'il existe
    const oldModal = document.getElementById('action-selector-modal');
    if (oldModal) oldModal.remove();

    // Ajouter des styles pour agrandir le conteneur
    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
        /* Positionner le menu d'ajout d'action à droite */
        .action-menu-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 18px;
            justify-content: flex-end; /* Aligne à droite */
            padding: 12px 15px;
            background-color: rgba(var(--accent-rgb, 0, 123, 255), 0.08);
            border-radius: 8px;
        }
        
        /* Agrandir la fenêtre modale d'événement */
        .event-modal-content.event-modal-with-preview {
            width: 95% !important;
            max-width: 1500px !important;
            height: 90vh !important;
            max-height: 90vh !important;
        }
        
        /* Autres styles pour l'agrandissement existants */
        .sequence-container-wrapper {
            max-width: 100% !important;
            width: 100% !important;
        }
        
        .sequence-container {
            height: 450px !important; 
            max-height: 70vh !important;
        }
        
        .action-select {
            min-width: 200px;
            padding: 8px 12px !important;
            font-size: 1.05em !important;
        }
        
        .add-action-menu-btn {
            width: 42px !important;
            height: 42px !important;
            font-size: 1.5em !important;
        }
        
        .sequence-action {
            margin-bottom: 15px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .sequence-action-info {
            padding: 15px !important;
        }
        
        .action-config-panel {
            padding: 15px !important;
        }
        
        .config-field-group input,
        .config-field-group select,
        .config-field-group textarea {
            padding: 8px 12px !important;
            font-size: 1.05em !important;
        }
        
        .config-save-btn {
            padding: 8px 15px !important;
            font-size: 1.05em !important;
        }
        
        .sequence-controls {
            margin-top: 20px !important;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
        }
        
        .sequence-controls button {
            padding: 10px 20px !important;
            font-size: 1.05em !important;
        }
    `;
    document.head.appendChild(extraStyle);

    // Attendre un peu pour s'assurer que tous les éléments sont chargés
    setTimeout(() => {
        // Agrandir directement la fenêtre modale d'événement
        const eventModals = document.querySelectorAll('.event-modal-content');
        eventModals.forEach(modal => {
            if (modal.classList.contains('event-modal-with-preview')) {
                modal.style.width = '95%';
                modal.style.maxWidth = '1500px';
                modal.style.height = '90vh';
                modal.style.maxHeight = '90vh';
            }
        });

        // Modifier le conteneur de séquence pour plus d'espace
        const seqContainer = document.querySelector('.sequence-container');
        if (seqContainer) {
            seqContainer.style.maxHeight = '600px';
            seqContainer.style.height = 'auto';
            seqContainer.style.minHeight = '450px';
        }

        // Déplacer le menu d'action à droite
        const actionMenu = document.querySelector('.action-menu-container');
        if (actionMenu) {
            actionMenu.style.justifyContent = 'flex-end';
            actionMenu.style.marginLeft = 'auto';
            actionMenu.style.width = 'fit-content';
            actionMenu.style.paddingRight = '20px';
        }
    }, 100);

    // Corriger également tous les boutons d'action pour empêcher la soumission du formulaire
    document.addEventListener('click', function(e) {
        // Pour les boutons de configuration
        if (e.target.classList.contains('config-save-btn') || 
            e.target.classList.contains('action-config-btn') ||
            e.target.classList.contains('action-delete-btn')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});

// Modifier la fonction createConfigFields pour créer des formulaires spécifiques à chaque type d'action
function createConfigFields(actionType, parameters = {}) {
    let html = '';
    
    switch(actionType) {
        case 'pause':
            const pauseDuration = parameters.duration || 2;
            html = `
                <div class="config-field-group">
                    <label for="pause-duration">Durée de pause (secondes):</label>
                    <input type="number" id="pause-duration" value="${pauseDuration}" min="0.1" step="0.5" class="form-control">
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        case 'boat':
            const boatAction = parameters.action || 'stop';
            const boatDuration = parameters.duration || 2;
            html = `
                <div class="config-field-group">
                    <label for="boat-action">Action du bateau:</label>
                    <select id="boat-action" class="form-control">
                        <option value="stop" ${boatAction === 'stop' ? 'selected' : ''}>Arrêter</option>
                        <option value="move" ${boatAction === 'move' ? 'selected' : ''}>Déplacer</option>
                        <option value="turn_left" ${boatAction === 'turn_left' ? 'selected' : ''}>Tourner à gauche</option>
                        <option value="turn_right" ${boatAction === 'turn_right' ? 'selected' : ''}>Tourner à droite</option>
                        <option value="speed_up" ${boatAction === 'speed_up' ? 'selected' : ''}>Accélérer</option>
                        <option value="slow_down" ${boatAction === 'slow_down' ? 'selected' : ''}>Ralentir</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="boat-duration">Durée de l'action (secondes):</label>
                    <input type="number" id="boat-duration" value="${boatDuration}" min="0" step="0.5" class="form-control">
                    <small class="form-text text-muted">Laissez vide ou 0 pour maintenir jusqu'à la prochaine action bateau</small>
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        case 'sound':
            const soundFile = parameters.file || '';
            const soundVolume = parameters.volume || 0.8;
            const soundName = parameters.soundName || '';
            const loop = parameters.loop || false;
            const loopCount = parameters.loopCount || '';
            const control = parameters.control || 'normal';
            // Liste des sons dynamiques
            const soundOptions = [
                'login_beep','data_transfer','error_tone','static_burst','soft_beep','alarm_soft','alarm','system_beep','notification','warning_beep','upload_complete','keyboard_typing','lock_click','relief_sigh','alarm_loud','power_down','radio_static','electrical_surge','countdown','system_process','system_failure','whispers','water_splash'
            ];
            html = `
                <div class="config-field-group">
                    <label for="sound-file">Fichier audio:</label>
                    <div class="input-group">
                        <input type="text" id="sound-file" value="${soundFile}" class="form-control" readonly>
                        <div class="input-group-append">
                            <button type="button" class="btn browse-media-btn" data-type="sound">Parcourir</button>
                        </div>
                    </div>
                </div>
                <div class="config-field-group">
                    <label for="sound-name">Ou choisir un son système :</label>
                    <select id="sound-name" class="form-control">
                        <option value="">-- Aucun --</option>
                        ${soundOptions.map(opt => `<option value="${opt}" ${soundName===opt?'selected':''}>${opt}</option>`).join('')}
                    </select>
                    <button type="button" id="test-sound-btn" style="margin-left:10px;">Tester</button>
                </div>
                <div class="config-field-group">
                    <label><input type="checkbox" id="sound-loop" ${loop ? 'checked' : ''}> Jouer en boucle</label>
                </div>
                <div class="config-field-group">
                    <label for="sound-loop-count">Nombre de répétitions (0 = infini):</label>
                    <input type="number" id="sound-loop-count" min="0" value="${loopCount}" class="form-control" style="width:100px;display:inline-block;">
                </div>
                <div class="config-field-group">
                    <label for="sound-control">Mode de contrôle :</label>
                    <select id="sound-control" class="form-control">
                        <option value="normal" ${control==='normal'?'selected':''}>Normal (jouer une fois ou en boucle)</option>
                        <option value="start" ${control==='start'?'selected':''}>Démarrer la boucle (start)</option>
                        <option value="stop" ${control==='stop'?'selected':''}>Arrêter la boucle (stop)</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="sound-volume">Volume:</label>
                    <input type="range" id="sound-volume" min="0" max="1" step="0.1" value="${soundVolume}" class="form-control">
                    <span id="volume-value">${soundVolume}</span>
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        case 'door':
            const doorId = parameters.doorId || '1';
            const doorAction = parameters.action || 'open';
            const doorDuration = parameters.duration || 3;
            html = `
                <div class="config-field-group">
                    <label for="door-id">ID de la porte:</label>
                    <select id="door-id" class="form-control">
                        <option value="1" ${doorId === '1' ? 'selected' : ''}>Porte 1</option>
                        <option value="2" ${doorId === '2' ? 'selected' : ''}>Porte 2</option>
                        <option value="3" ${doorId === '3' ? 'selected' : ''}>Porte 3</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="door-action">Action:</label>
                    <select id="door-action" class="form-control">
                        <option value="open" ${doorAction === 'open' ? 'selected' : ''}>Ouvrir</option>
                        <option value="close" ${doorAction === 'close' ? 'selected' : ''}>Fermer</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="door-duration">Durée de l'animation (secondes):</label>
                    <input type="number" id="door-duration" value="${doorDuration}" min="0.5" step="0.5" class="form-control">
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        case 'light':
            const lightColor = parameters.color || 'white';
            const lightPattern = parameters.pattern || 'static';
            const lightDuration = parameters.duration || 2;
            const lightOpacity = parameters.opacity !== undefined ? parameters.opacity : 1;
            const lightEffect = parameters.effect || 'static';
            html = `
                <div class="config-field-group">
                    <label for="light-color">Couleur:</label>
                    <input type="color" id="light-color" value="${lightColor === 'white' ? '#FFFFFF' : lightColor}" class="form-control">
                </div>
                <div class="config-field-group">
                    <label for="light-opacity">Opacité:</label>
                    <input type="number" id="light-opacity" value="${lightOpacity}" min="0" max="1" step="0.05" class="form-control">
                </div>
                <div class="config-field-group">
                    <label for="light-effect">Effet:</label>
                    <select id="light-effect" class="form-control">
                        <option value="static" ${lightEffect === 'static' ? 'selected' : ''}>Statique (allumé)</option>
                        <option value="flicker" ${lightEffect === 'flicker' ? 'selected' : ''}>Vacillement</option>
                        <option value="pulse" ${lightEffect === 'pulse' ? 'selected' : ''}>Pulsation</option>
                        <option value="halo" ${lightEffect === 'halo' ? 'selected' : ''}>Halo</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="light-duration">Durée (secondes):</label>
                    <input type="number" id="light-duration" value="${lightDuration}" min="0.5" step="0.5" class="form-control">
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        case 'message':
            const messageText = parameters.text || 'Message texte';
            const messageColor = parameters.color || '#FFFFFF';
            const messageDuration = parameters.duration || 3;
            const messageFade = parameters.fade || false;
            const messageFont = parameters.font || 'default';
            html = `
                <div class="config-field-group">
                    <label for="message-text">Texte du message:</label>
                    <input type="text" id="message-text" value="${messageText}" class="form-control">
                </div>
                <div class="config-field-group">
                    <label for="message-color">Couleur du texte:</label>
                    <input type="color" id="message-color" value="${messageColor}" class="form-control">
                </div>
                <div class="config-field-group">
                    <label for="message-font">Police:</label>
                    <select id="message-font" class="form-control">
                        <option value="default" ${messageFont === 'default' ? 'selected' : ''}>Par défaut</option>
                        <option value="pixelated" ${messageFont === 'pixelated' ? 'selected' : ''}>Pixelisée</option>
                        <option value="handwritten" ${messageFont === 'handwritten' ? 'selected' : ''}>Manuscrite</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="message-fade">Effet de fondu:</label>
                    <select id="message-fade" class="form-control">
                        <option value="false" ${!messageFade ? 'selected' : ''}>Aucun</option>
                        <option value="true" ${messageFade ? 'selected' : ''}>Fondu</option>
                    </select>
                </div>
                <div class="config-field-group">
                    <label for="message-duration">Durée d'affichage (secondes):</label>
                    <input type="number" id="message-duration" value="${messageDuration}" min="0.5" step="0.5" class="form-control">
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        case 'video':
        case 'image':
        case 'gif':
            const mediaFile = parameters.file || '';
            const mediaDuration = parameters.duration || 5;
            const mediaPosition = parameters.position || 'center';
            html = `
                <div class="config-field-group">
                    <label for="${actionType}-file">Fichier ${actionType === 'video' ? 'vidéo' : actionType === 'image' ? 'image' : 'GIF'}:</label>
                    <div class="input-group">
                        <input type="text" id="${actionType}-file" value="${mediaFile}" class="form-control" readonly>
                        <div class="input-group-append">
                            <button type="button" class="btn browse-media-btn" data-type="${actionType}">Parcourir</button>
                        </div>
                    </div>
                </div>
                ${actionType !== 'video' ? `
                <div class="config-field-group">
                    <label for="${actionType}-position">Position à l'écran:</label>
                    <select id="${actionType}-position" class="form-control">
                        <option value="center" ${mediaPosition === 'center' ? 'selected' : ''}>Centre</option>
                        <option value="top" ${mediaPosition === 'top' ? 'selected' : ''}>Haut</option>
                        <option value="bottom" ${mediaPosition === 'bottom' ? 'selected' : ''}>Bas</option>
                        <option value="left" ${mediaPosition === 'left' ? 'selected' : ''}>Gauche</option>
                        <option value="right" ${mediaPosition === 'right' ? 'selected' : ''}>Droite</option>
                        <option value="fullscreen" ${mediaPosition === 'fullscreen' ? 'selected' : ''}>Plein écran</option>
                    </select>
                </div>` : ''}
                <div class="config-field-group">
                    <label for="${actionType}-duration">Durée d'affichage${actionType === 'video' ? ' (0 = durée de la vidéo)' : ''} (secondes):</label>
                    <input type="number" id="${actionType}-duration" value="${mediaDuration}" min="0" step="0.5" class="form-control">
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
            
        // On garde quand même l'option "custom" pour les utilisateurs avancés
        case 'custom':
            const customCode = parameters.code || '// Code JavaScript personnalisé';
            const customDescription = parameters.description || 'Action personnalisée';
            html = `
                <div class="config-field-group">
                    <label for="custom-description">Description:</label>
                    <input type="text" id="custom-description" value="${customDescription}" class="form-control">
                </div>
                <div class="config-field-group">
                    <label for="custom-code">Code JavaScript:</label>
                    <textarea id="custom-code" rows="4" class="form-control">${customCode}</textarea>
                </div>
                <div class="config-actions">
                    <button type="button" class="config-save-btn">Appliquer</button>
                </div>
            `;
            break;
    }
    
    return html;
}

// Nouvelle fonction pour sauvegarder la configuration avec les nouveaux champs
function saveActionConfig(actionId, actionType, configPanel) {
    const action = sequenceActions.find(a => a.id === actionId);
    if (!action) return false;
    
    // Récupérer les valeurs selon le type d'action
    switch(actionType) {
        case 'pause':
            const pauseDuration = parseFloat(configPanel.querySelector('#pause-duration').value) || 0;
            action.duration = pauseDuration;
            // Pas de paramètres nécessaires pour pause
            action.parameters = {};
            break;
            
        case 'boat':
            action.parameters = {
                action: configPanel.querySelector('#boat-action').value
            };
            action.duration = parseFloat(configPanel.querySelector('#boat-duration').value) || 0;
            break;
            
        case 'sound':
            const fileValue = configPanel.querySelector('#sound-file').value;
            const soundNameValue = configPanel.querySelector('#sound-name') ? configPanel.querySelector('#sound-name').value : '';
            let file = fileValue;
            let soundName = soundNameValue;
            // Exclusivité : si un son système est choisi, ignorer le fichier, sinon l'inverse
            if (soundName) file = '';
            if (file) soundName = '';
            action.parameters = {
                file: file,
                volume: parseFloat(configPanel.querySelector('#sound-volume').value) || 0.8,
                soundName: soundName,
                loop: configPanel.querySelector('#sound-loop')?.checked || false,
                loopCount: parseInt(configPanel.querySelector('#sound-loop-count')?.value) || 0,
                control: configPanel.querySelector('#sound-control')?.value || 'normal'
            };
            break;
            
        case 'door':
            action.parameters = {
                doorId: configPanel.querySelector('#door-id').value,
                action: configPanel.querySelector('#door-action').value
            };
            action.duration = parseFloat(configPanel.querySelector('#door-duration').value) || 3;
            break;
            
        case 'light':
            const lightPattern = configPanel.querySelector('#light-pattern') ? configPanel.querySelector('#light-pattern').value : 'static';
            let pattern = lightPattern;
            if (lightPattern === 'flicker') {
                pattern = 'flicker 0.5s infinite';
            } else if (lightPattern === 'pulse') {
                pattern = 'pulse 2s infinite';
            }
            action.parameters = {
                color: configPanel.querySelector('#light-color').value,
                pattern: pattern,
                opacity: parseFloat(configPanel.querySelector('#light-opacity')?.value) || 1,
                effect: configPanel.querySelector('#light-effect')?.value || 'static'
            };
            action.duration = parseFloat(configPanel.querySelector('#light-duration').value) || 2;
            break;
            
        case 'message':
            action.parameters = {
                text: configPanel.querySelector('#message-text').value,
                color: configPanel.querySelector('#message-color').value,
                font: configPanel.querySelector('#message-font').value,
                fade: configPanel.querySelector('#message-fade').value === 'true'
            };
            action.duration = parseFloat(configPanel.querySelector('#message-duration').value) || 3;
            break;
            
        case 'video':
        case 'image':
        case 'gif':
            const mediaParams = {
                file: configPanel.querySelector(`#${actionType}-file`).value
            };
            
            if (actionType !== 'video') {
                mediaParams.position = configPanel.querySelector(`#${actionType}-position`).value;
            }
            
            action.parameters = mediaParams;
            action.duration = parseFloat(configPanel.querySelector(`#${actionType}-duration`).value) || 5;
            break;
            
        case 'custom':
            action.parameters = {
                code: configPanel.querySelector('#custom-code').value,
                description: configPanel.querySelector('#custom-description').value
            };
            break;
            
        default:
            try {
                const jsonParams = configPanel.querySelector('#action-params-json');
                if (jsonParams) {
                    action.parameters = JSON.parse(jsonParams.value);
                }
            } catch (e) {
                console.error('Erreur de parsing JSON:', e);
                alert('Les paramètres JSON sont invalides');
                return false;
            }
    }
    
    // Mettre à jour l'affichage
    updateSequenceDisplay();
    return true;
}

// Fonction pour ouvrir un explorateur de fichiers ou la bibliothèque média
function setupMediaBrowsers() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('browse-media-btn')) {
            e.preventDefault();
            
            const mediaType = e.target.getAttribute('data-type');
            const inputField = e.target.closest('.input-group').querySelector('input');
            
            // Ici, on pourrait ouvrir une bibliothèque de médias, mais pour simplifier:
            // On va simuler une sélection pour le moment
            
            // Dans un cas réel, on ouvrirait une modale ou un explorateur de fichiers
            const dummyFiles = {
                'sound': ['sfx/alert.mp3', 'sfx/success.mp3', 'sfx/error.mp3', 'sfx/ding.mp3'],
                'video': ['videos/intro.mp4', 'videos/background.mp4', 'videos/action.mp4'],
                'image': ['images/logo.png', 'images/background.jpg', 'images/character.png'],
                'gif': ['gifs/animation.gif', 'gifs/loading.gif', 'gifs/effect.gif']
            };
            
            const files = dummyFiles[mediaType] || [];
            let filesList = '';
            
            files.forEach(file => {
                filesList += `<button class="media-select-btn" data-file="${file}">${file}</button>`;
            });
            
            // Créer un modal temporaire pour la sélection
            const mediaModal = document.createElement('div');
            mediaModal.className = 'media-selection-modal';
            mediaModal.innerHTML = `
                <div class="media-selection-content">
                    <div class="media-selection-header">
                        <h3>Sélectionner un fichier ${mediaType}</h3>
                        <button class="close-media-selection">&times;</button>
                    </div>
                    <div class="media-files-list">
                        ${filesList || '<p>Aucun fichier disponible</p>'}
                    </div>
                    <div class="media-selection-footer">
                        <button class="upload-new-media">Importer un nouveau fichier</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(mediaModal);
            
            // Styles pour le modal
            const style = document.createElement('style');
            style.textContent = `
                .media-selection-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                .media-selection-content {
                    background-color: var(--background-color, #fff);
                    border-radius: 8px;
                    width: 80%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                }
                .media-selection-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid var(--border-color, #ccc);
                }
                .media-selection-header h3 {
                    margin: 0;
                }
                .close-media-selection {
                    background: none;
                    border: none;
                    font-size: 1.5em;
                    cursor: pointer;
                }
                .media-files-list {
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
                .media-select-btn {
                    padding: 10px;
                    background-color: var(--secondary-color, #f0f0f0);
                    border: 1px solid var(--border-color, #ccc);
                    border-radius: 4px;
                    cursor: pointer;
                    text-align: center;
                    word-break: break-word;
                }
                .media-select-btn:hover {
                    background-color: var(--accent-color-transparent, #e0e0e0);
                }
                .media-selection-footer {
                    padding: 15px 20px;
                    border-top: 1px solid var(--border-color, #ccc);
                    text-align: right;
                }
                .upload-new-media {
                    padding: 8px 16px;
                    background-color: var(--accent-color, #007bff);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
            
            // Événements pour le modal
            mediaModal.querySelector('.close-media-selection').onclick = function() {
                mediaModal.remove();
                style.remove();
            };
            
            // Sélection de fichier
            mediaModal.querySelectorAll('.media-select-btn').forEach(btn => {
                btn.onclick = function() {
                    const selectedFile = this.getAttribute('data-file');
                    inputField.value = selectedFile;
                    mediaModal.remove();
                    style.remove();
                };
            });
            
            // Simuler un upload
            mediaModal.querySelector('.upload-new-media').onclick = function() {
                // Dans un cas réel, on ouvrirait l'explorateur de fichiers
                alert("Cette fonctionnalité simulerait l'importation d'un nouveau fichier.");
                
                // Simuler un fichier uploadé
                const timeStamp = new Date().getTime();
                const newFile = `${mediaType}s/uploaded_${timeStamp}.${mediaType === 'sound' ? 'mp3' : mediaType === 'video' ? 'mp4' : mediaType === 'image' ? 'jpg' : 'gif'}`;
                inputField.value = newFile;
                
                mediaModal.remove();
                style.remove();
            };
        }
    });
}

// Initialisation des explorateurs de médias
document.addEventListener('DOMContentLoaded', function() {
    setupMediaBrowsers();
});

// Remplacer la fonction createActionElement pour utiliser la nouvelle interface
function improvedCreateActionElement(action) {
    // Récupérer le template
    const template = document.getElementById('improved-action-template');
    if (!template) {
        console.error("Template #improved-action-template introuvable!");
        return document.createElement('div');
    }
    
    const templateContent = template.content.cloneNode(true);
    const actionElement = templateContent.querySelector('.sequence-action');
    
    // Définir l'ID de l'action
    actionElement.dataset.actionId = action.id;
    actionElement.dataset.actionType = action.type;
    
    // Définir l'icône et le nom du type
    let typeIcon = '⚙️';
    let typeName = 'Action personnalisée';
    
    switch (action.type) {
        case 'sound': typeIcon = '🔊'; typeName = 'Son'; break;
        case 'message': typeIcon = '💬'; typeName = 'Message'; break;
        case 'door': typeIcon = '🚪'; typeName = 'Porte'; break;
        case 'light': typeIcon = '💡'; typeName = 'Lumière'; break;
        case 'video': typeIcon = '🎬'; typeName = 'Vidéo'; break;
        case 'image': typeIcon = '🖼️'; typeName = 'Image'; break;
        case 'boat': typeIcon = '⛵'; typeName = 'Bateau'; break;
        case 'gif': typeIcon = '🎞️'; typeName = 'GIF'; break;
        case 'pause': typeIcon = '⏱️'; typeName = 'Pause'; break;
        case 'custom': typeIcon = '🔧'; typeName = 'Personnalisé'; break;
    }
    
    // Mettre à jour l'affichage avec les valeurs réelles
    actionElement.querySelector('.action-type-indicator').textContent = typeIcon;
    actionElement.querySelector('.action-name').textContent = typeName;
    actionElement.querySelector('.action-duration-field').value = action.duration || 0;
    
    // Résumé des paramètres
    let paramSummary = '';
    switch (action.type) {
        case 'sound':
            paramSummary = `Son: ${action.parameters?.file || 'Non spécifié'}, Volume: ${action.parameters?.volume || 1}`;
            break;
        case 'message':
            paramSummary = `"${action.parameters?.text || 'Texte non spécifié'}"`;
            break;
        case 'door':
            paramSummary = `Porte ${action.parameters?.doorId || '?'}: ${action.parameters?.action === 'open' ? 'Ouvrir' : 'Fermer'}`;
            break;
        case 'light':
            paramSummary = `Couleur: ${action.parameters?.color || 'blanc'}, Motif: ${action.parameters?.pattern || 'statique'}`;
            break;
        case 'video':
        case 'image':
        case 'gif':
            paramSummary = `Fichier: ${action.parameters?.file || 'Non spécifié'}`;
            break;
        case 'boat':
            let boatAction = 'Arrêter';
            switch(action.parameters?.action) {
                case 'move': boatAction = 'Déplacer'; break;
                case 'turn_left': boatAction = 'Tourner à gauche'; break;
                case 'turn_right': boatAction = 'Tourner à droite'; break;
                case 'speed_up': boatAction = 'Accélérer'; break;
                case 'slow_down': boatAction = 'Ralentir'; break;
            }
            paramSummary = `Action: ${boatAction}`;
            break;
        case 'pause':
            paramSummary = `Durée d'attente: ${action.duration || 0} secondes`;
            break;
        case 'custom':
            paramSummary = action.parameters?.description || 'Code personnalisé';
            break;
        default:
            paramSummary = 'Paramètres non définis';
    }
    
    // Mettre à jour le résumé des paramètres
    actionElement.querySelector('.action-param-display').textContent = paramSummary;
    
    // Gestionnaires d'événements
    // 1. Pour le bouton de suppression
    actionElement.querySelector('.action-delete-btn').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
            const index = sequenceActions.findIndex(a => a.id === action.id);
            if (index !== -1) {
                sequenceActions.splice(index, 1);
                updateSequenceDisplay();
            }
        }
    });
    
    // 2. Pour le bouton de configuration
    actionElement.querySelector('.action-config-btn').addEventListener('click', () => {
        const configPanel = actionElement.querySelector('.action-config-panel');
        
        if (configPanel.style.display === 'none') {
            // Générer le panneau de configuration
            configPanel.innerHTML = createConfigFields(action.type, action.parameters);
            configPanel.style.display = 'block';
            
            // Ajouter les gestionnaires d'événements aux champs spécifiques
            if (action.type === 'sound') {
                const volumeInput = configPanel.querySelector('#sound-volume');
                const volumeValue = configPanel.querySelector('#volume-value');
                volumeInput.addEventListener('input', () => {
                    volumeValue.textContent = volumeInput.value;
                });
                // Gestionnaire pour le bouton de test du son système
                const testBtn = configPanel.querySelector('#test-sound-btn');
                const select = configPanel.querySelector('#sound-name');
                const fileInput = configPanel.querySelector('#sound-file');
                if (testBtn && select) {
                    testBtn.addEventListener('click', () => {
                        if (select.value) {
                            if (typeof playSound === 'function') {
                                playSound(select.value);
                            } else {
                                console.error("La fonction playSound n'est pas définie. Assurez-vous que basic_sounds.js est chargé correctement.");
                                alert("Le système de son n'est pas disponible. Vérifiez que basic_sounds.js est chargé correctement.");
                            }
                        }
                    });
                }
                // Exclusivité UI : si on choisit un son système, vider le champ fichier
                if (select && fileInput) {
                    select.addEventListener('change', () => {
                        if (select.value) fileInput.value = '';
                    });
                    fileInput.addEventListener('input', () => {
                        if (fileInput.value) select.value = '';
                    });
                }
            }
            
            // Gestionnaire pour le bouton de sauvegarde
            const saveBtn = configPanel.querySelector('.config-save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    if (saveActionConfig(action.id, action.type, configPanel)) {
                        configPanel.style.display = 'none';
                    }
                });
            }
        } else {
            configPanel.style.display = 'none';
        }
    });
    
    // 3. Pour le champ de durée
    actionElement.querySelector('.action-duration-field').addEventListener('change', (e) => {
        const duration = parseFloat(e.target.value);
        if (!isNaN(duration)) {
            action.duration = duration;
        }
    });
    
    // 4. Pour le glisser-déposer
    actionElement.querySelector('.action-move-handle').addEventListener('mousedown', () => {
        actionElement.setAttribute('draggable', 'true');
    });
    
    actionElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', action.id);
        actionElement.classList.add('dragging');
        // Stocker une référence à l'élément glissé
        window.draggedItem = actionElement;
        window.draggedId = action.id;
    });
    
    actionElement.addEventListener('dragend', () => {
        actionElement.classList.remove('dragging');
        actionElement.setAttribute('draggable', 'false');
    });
    
    return actionElement;
}

// Fonction pour afficher le sélecteur d'action
function showActionSelector() {
    const modal = document.getElementById('action-selector-modal');
    modal.classList.add('active');
    
    // Ajouter les gestionnaires d'événements aux éléments du sélecteur
    document.querySelectorAll('.action-grid-item').forEach(item => {
        item.onclick = () => {
            const actionType = item.dataset.actionType;
            createQuickAction(actionType);
            modal.classList.remove('active');
        };
    });
    
    // Gestionnaire pour fermer le modal
    document.querySelector('#action-selector-modal .close-selector').onclick = () => {
        modal.classList.remove('active');
    };
}

// Fonction pour mettre à jour l'affichage de la séquence
function improvedUpdateSequenceDisplay() {
    // Sauvegarde de la fonction originale pour pouvoir l'appeler
    const originalUpdateSequenceDisplay = window.updateSequenceDisplay;
    
    // Nouvelle implémentation
    window.updateSequenceDisplay = function() {
        const container = document.getElementById('sequence-container');
        const emptyMessage = document.querySelector('.sequence-empty-message');
        
        // Afficher/masquer le message "vide"
        if (sequenceActions.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
        
        // Vider le conteneur (sauf le message vide)
        Array.from(container.children).forEach(child => {
            if (!child.classList.contains('sequence-empty-message')) {
                container.removeChild(child);
            }
        });
        
        // Ajouter chaque action à l'affichage avec la nouvelle interface
        sequenceActions.forEach(action => {
            const actionElement = improvedCreateActionElement(action);
            container.appendChild(actionElement);
        });
        
        // Activer le tri par glisser-déposer
        if (typeof enableDragAndDrop === 'function') {
            enableDragAndDrop();
        }
    };
}

// Initialiser l'amélioration de l'interface lorsque le document est prêt
document.addEventListener('DOMContentLoaded', function() {
    // Remplacer la fonction de création d'élément d'action
    window.originalCreateActionElement = window.createActionElement;
    window.createActionElement = improvedCreateActionElement;
    
    // Remplacer la fonction de mise à jour de l'affichage
    improvedUpdateSequenceDisplay();
    
    // Initialiser l'affichage
    if (typeof updateSequenceDisplay === 'function') {
        updateSequenceDisplay();
    }
    
    console.log('Interface de séquence améliorée initialisée avec succès');

    // Trouver et sécuriser le formulaire d'événement
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        const originalSubmit = eventForm.onsubmit;
        eventForm.onsubmit = function(e) {
            // Si le bouton cliqué n'est pas le bouton de sauvegarde, empêcher la soumission
            const target = e.submitter || e.explicitOriginalTarget || document.activeElement;
            if (target && target.id !== 'save-event-btn') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            // Sinon, continuer avec le comportement normal
            if (typeof originalSubmit === 'function') {
                return originalSubmit.call(this, e);
            }
        };
    }
}); 