/**
 * scene_init.js
 * Basic Three.js scene initialization for Sethos AI
 */

// Global variables for Three.js
let scene, camera, renderer;
let boat, ocean;
let mixer;
let clock = new THREE.Clock();
let animationFrameId;

// Make sure initScene is defined globally
if (typeof window.initScene !== 'function') {
    // Initialize the 3D scene
    window.initScene = function() {
        console.log(" Initializing 3D scene...");
        
        try {
            // Create the scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x090920);
            scene.fog = new THREE.FogExp2(0x0c0c2a, 0.002);
            
            // Create the camera
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 10, 20);
            camera.lookAt(0, 0, 0);
            
            // Create the renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            
            // Add the renderer to the document
            const container = document.getElementById('scene-container');
            if (container) {
                container.appendChild(renderer.domElement);
            } else {
                document.body.appendChild(renderer.domElement);
            }
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 10, 7.5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            
            // Create basic ocean
            const oceanGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
            const oceanMaterial = new THREE.MeshStandardMaterial({
                color: 0x0066aa,
                metalness: 0.3,
                roughness: 0.7
            });
            ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
            ocean.rotation.x = -Math.PI / 2;
            ocean.position.y = -1;
            scene.add(ocean);
            
            // Create a simple boat placeholder
            const boatGeometry = new THREE.BoxGeometry(5, 2, 10);
            const boatMaterial = new THREE.MeshStandardMaterial({
                color: 0x885533,
                metalness: 0.1,
                roughness: 0.8
            });
            boat = new THREE.Mesh(boatGeometry, boatMaterial);
            boat.position.y = 1;
            scene.add(boat);
            
            // Add resize handler
            window.addEventListener('resize', handleResize);
            
            // Start animation loop
            animate();
            
            console.log(" 3D scene initialized successfully");
        } catch (error) {
            console.error(" Error initializing 3D scene:", error);
        }
    };
}

// Animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Calculate delta time
    const delta = clock.getDelta();
    
    // Update animations if mixer exists
    if (mixer) {
        mixer.update(delta);
    }
    
    // Animate ocean waves
    if (ocean) {
        const vertices = ocean.geometry.attributes.position.array;
        const time = Date.now() * 0.0005;
        
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.sin(vertices[i] / 5 + time) * 0.5 +
                             Math.sin(vertices[i + 1] / 5 + time) * 0.5;
        }
        
        ocean.geometry.attributes.position.needsUpdate = true;
    }
    
    // Gently rock the boat
    if (boat) {
        boat.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
        boat.rotation.x = Math.sin(Date.now() * 0.0015) * 0.03;
        boat.position.y = 0.5 + Math.sin(Date.now() * 0.002) * 0.1;
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Handle window resize
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Clean up resources
window.cleanupScene = function() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', handleResize);
    
    console.log(" 3D scene resources cleaned up");
};

// Execute this immediately to ensure initScene is available when needed
document.addEventListener('DOMContentLoaded', function() {
    console.log("Scene initialization script loaded and ready");
    // Check if THREE.js is available
    if (typeof THREE === 'undefined') {
        console.error("THREE.js is not loaded! Scene initialization will fail.");
    }
}); 