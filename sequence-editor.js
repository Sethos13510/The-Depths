/**
 * sequence-editor.js
 * Script for editing and managing event sequences
 */

(function() {
    console.log(" === INITIALISATION DRAG & DROP (RÉORDONNANCEMENT) ===");
    
    // Initialize event count
    let eventCount = 0;
    try {
        const sequenceContainer = document.getElementById('sequence-container');
        if (sequenceContainer) {
            eventCount = sequenceContainer.children.length;
        }
        console.log(" Nombre d'actions dans la séquence: " + eventCount);
    } catch (error) {
        console.error(" Erreur lors de l'initialisation: ", error);
    }
    
    // Create a quick action function
    window.createQuickAction = function(id, title, description, callback) {
        const actionItem = document.createElement('div');
        actionItem.className = 'quick-action-item';
        actionItem.setAttribute('data-id', id);
        
        actionItem.innerHTML = `
            <div class="quick-action-header">
                <h4>${title}</h4>
            </div>
            <div class="quick-action-body">
                <p>${description}</p>
            </div>
        `;
        
        actionItem.addEventListener('click', callback);
        
        return actionItem;
    };
    
    // Initialize sequence editing capabilities
    window.initSequenceEditing = function() {
        const sequenceContainer = document.getElementById('sequence-container');
        if (!sequenceContainer) return;
        
        // Make items draggable
        const items = sequenceContainer.querySelectorAll('.sequence-item');
        items.forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
                this.classList.add('dragging');
            });
            
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
        });
        
        // Set up drop targets
        sequenceContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(sequenceContainer, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (afterElement == null) {
                sequenceContainer.appendChild(draggable);
            } else {
                sequenceContainer.insertBefore(draggable, afterElement);
            }
        });
        
        function getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.sequence-item:not(.dragging)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }
    };
    
    console.log(" Interface de séquence améliorée initialisée avec succès");
})(); 