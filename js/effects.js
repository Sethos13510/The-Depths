/**
 * Module pour les effets visuels et animations
 */

/**
 * Crée un effet lumineux flash
 * @param {number} color - Couleur au format hexadécimal (0xRRGGBB)
 * @param {number} duration - Durée de l'effet en ms
 */
function flashLightEffect(color, duration = 1000) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = `#${color.toString(16).padStart(6, '0')}`;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'opacity 0.2s ease-in-out';
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '0.5';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 200);
        }, duration - 400);
    }, 10);
}

/**
 * Crée un effet de pulsation lumineuse
 * @param {number} color - Couleur au format hexadécimal (0xRRGGBB)
 * @param {number} pulses - Nombre de pulsations
 * @param {number} duration - Durée d'une pulsation en ms
 */
function pulseLightEffect(color, pulses = 3, duration = 500) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = `#${color.toString(16).padStart(6, '0')}`;
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'opacity 0.2s ease-in-out';
    
    document.body.appendChild(overlay);
    
    let currentPulse = 0;
    
    const doPulse = () => {
        if (currentPulse >= pulses) {
            document.body.removeChild(overlay);
            return;
        }
        
        overlay.style.opacity = '0.3';
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                currentPulse++;
                doPulse();
            }, duration / 2);
        }, duration / 2);
    };
    
    doPulse();
}

/**
 * Crée un effet de tremblement de la caméra/écran
 * @param {number} intensity - Intensité du tremblement (0-1)
 * @param {number} duration - Durée de l'effet en ms
 */
function cameraShakeEffect(intensity = 0.5, duration = 1000) {
    const maxShake = 20 * intensity;
    const container = document.body;
    const originalTransition = container.style.transition;
    const originalTransform = container.style.transform;
    
    container.style.transition = 'transform 0.05s ease-in-out';
    
    let elapsed = 0;
    const interval = 50;
    const intervalId = setInterval(() => {
        elapsed += interval;
        
        if (elapsed >= duration) {
            clearInterval(intervalId);
            container.style.transform = originalTransform;
            container.style.transition = originalTransition;
            return;
        }
        
        const diminishFactor = 1 - (elapsed / duration);
        const xShake = (Math.random() * 2 - 1) * maxShake * diminishFactor;
        const yShake = (Math.random() * 2 - 1) * maxShake * diminishFactor;
        
        container.style.transform = `translate(${xShake}px, ${yShake}px)`;
    }, interval);
}

/**
 * Crée un effet de distorsion de l'écran
 * @param {number} intensity - Intensité de la distorsion (0-1)
 * @param {number} duration - Durée de l'effet en ms
 */
function screenDistortionEffect(intensity = 0.5, duration = 2000) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'><rect width=\'100\' height=\'100\' fill=\'none\' stroke=\'%23333\' stroke-width=\'0.5\' /></svg>")';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9998';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.mixBlendMode = 'difference';
    overlay.style.filter = 'blur(1px) contrast(120%)';
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = intensity.toString();
        
        let elapsed = 0;
        const interval = 100;
        const maxOffset = 5 * intensity;
        
        const intervalId = setInterval(() => {
            elapsed += interval;
            
            if (elapsed >= duration) {
                clearInterval(intervalId);
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
                return;
            }
            
            const diminishFactor = 1 - (elapsed / duration);
            const xOffset = (Math.random() * 2 - 1) * maxOffset * diminishFactor;
            const yOffset = (Math.random() * 2 - 1) * maxOffset * diminishFactor;
            
            overlay.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        }, interval);
    }, 10);
}

/**
 * Ajoute une apparition mystérieuse sur l'écran
 * @param {number} duration - Durée d'apparition en ms
 */
function mysteriousApparition(duration = 3000) {
    // Choix aléatoire d'un symbole
    const symbols = ['°øœæ¸', '¢¡¸', '°ø', '¢¡', '°ø', '°ø', '°ø', '°ø', '°ø', 'º§'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const apparition = document.createElement('div');
    apparition.style.position = 'fixed';
    apparition.style.fontSize = '100px';
    apparition.style.color = '#ffcc00';
    apparition.style.textShadow = '0 0 20px rgba(255, 204, 0, 0.8)';
    apparition.style.opacity = '0';
    apparition.style.pointerEvents = 'none';
    apparition.style.zIndex = '9997';
    apparition.style.transition = 'opacity 1s ease';
    apparition.textContent = symbol;
    
    // Position aléatoire
    apparition.style.top = `${Math.random() * 70 + 10}%`;
    apparition.style.left = `${Math.random() * 70 + 10}%`;
    
    document.body.appendChild(apparition);
    
    setTimeout(() => {
        apparition.style.opacity = '0.8';
        
        setTimeout(() => {
            apparition.style.opacity = '0';
            
            setTimeout(() => {
                document.body.removeChild(apparition);
                
                // Ajouter  l'historique
                addToStoryHistory('event', `Une apparition mystérieuse (${symbol}) a été aperçue.`);
            }, 1000);
        }, duration);
    }, 500);
}

/**
 * Crée un effet d'apparition de messages cryptés
 * @param {number} count - Nombre de messages
 * @param {number} duration - Durée d'affichage en ms
 */
function crypticMessagesEffect(count = 5, duration = 8000) {
    const crypticMessages = [
        translate("Le rituel sera accompli."),
        translate("Les profondeurs appellent."),
        translate("La vérité est immergée."),
        translate("L'éveil approche."),
        translate("Rejoignez-nous sous la surface."),
        translate("Le passage s'ouvre."),
        translate("L'ancien texte prédit votre venue."),
        translate("La porte est verrouillée à clé."),
        translate("Les coordonnées ont été transmises."),
        translate("Nous vous observons depuis longtemps.")
    ];
    
    let displayedCount = 0;
    
    const displayNext = () => {
        if (displayedCount >= count) return;
        
        const message = crypticMessages[Math.floor(Math.random() * crypticMessages.length)];
        const messageElement = document.createElement('div');
        messageElement.style.position = 'fixed';
        messageElement.style.padding = '10px 20px';
        messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageElement.style.color = '#33ff33';
        messageElement.style.border = '1px solid #33ff33';
        messageElement.style.borderRadius = '5px';
        messageElement.style.fontFamily = 'monospace';
        messageElement.style.fontSize = '14px';
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        messageElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        messageElement.style.zIndex = '9996';
        messageElement.style.pointerEvents = 'none';
        messageElement.textContent = message;
        
        // Position aléatoire
        messageElement.style.top = `${Math.random() * 60 + 20}%`;
        messageElement.style.left = `${Math.random() * 60 + 20}%`;
        
        document.body.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
            
            setTimeout(() => {
                messageElement.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(messageElement);
                }, 500);
            }, duration - 1000);
        }, 100);
        
        displayedCount++;
        
        if (displayedCount < count) {
            setTimeout(displayNext, Math.random() * 2000 + 1000);
        }
    };
    
    displayNext();
}

/**
 * Crée un effet de télétype pour simuler un terminal
 * @param {string} text - Texte à afficher
 * @param {number} speed - Vitesse d'affichage (ms par caractère)
 * @param {Function} callback - Fonction appelée à la fin
 */
function teletypeEffect(text, speed = 50, callback) {
    const terminalOutput = document.getElementById('terminal-output');
    if (!terminalOutput) {
        if (callback) callback();
        return;
    }
    
    const line = document.createElement('div');
    line.className = 'terminal-line';
    terminalOutput.appendChild(line);
    
    let i = 0;
    const intervalId = setInterval(() => {
        if (i >= text.length) {
            clearInterval(intervalId);
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            if (callback) callback();
            return;
        }
        
        line.textContent += text.charAt(i);
        i++;
        
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }, speed);
} 