/**
 * English translations for THE-DEPTHS
 * This file contains translations for all UI elements and messages
 */

// Translation dictionary
const englishTranslations = {
    // Main UI elements
    "title": "THE DEPTHS",
    "subtitle": "Season 1",
    "loading": "Loading...",
    "boat_speed": "Boat Speed",
    "donations": "Donations",
    "total": "Total",
    "goal": "Goal",
    "recent": "Recent",
    "leaderboard": "Leaderboard",
    "authenticate": "Authenticate",
    "start_experience": "Start Experience",
    "auth_message": "Authenticating... Please wait",
    
    // Navigation
    "home": "Home",
    "story": "Story",
    "map": "Map",
    "inventory": "Inventory",
    "settings": "Settings",
    
    // Story elements
    "mysteries": "Mysteries",
    "clues": "Clues",
    "narrative": "Narrative Fragments",
    "no_mysteries": "No mysteries discovered yet...",
    "no_clues": "No clues found yet...",
    "no_narrative": "No narrative fragments collected yet...",
    
    // Settings
    "sound_volume": "Sound Volume",
    "music_volume": "Music Volume",
    "quality": "Graphics Quality",
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "language": "Language",
    "french": "French",
    "english": "English",
    
    // Donation system
    "donation_received": "Donation received!",
    "donation_milestone": "Donation milestone reached!",
    "vote_started": "Vote started!",
    "vote_ended": "Vote ended!",
    "vote_now": "Vote Now",
    "time_remaining": "Time remaining",
    
    // Boat control
    "forwards": "Forwards",
    "backwards": "Backwards",
    "left": "Left",
    "right": "Right",
    "stop": "Stop",
    
    // Event messages
    "door_found": "You found a door!",
    "light_discovered": "Strange light discovered...",
    "mysterious_sound": "You hear a mysterious sound...",
    "water_rising": "The water is rising!",
    "water_receding": "The water is receding...",
    "tunnel_narrowing": "The tunnel is narrowing...",
    "tunnel_widening": "The tunnel is widening...",
    "something_ahead": "There's something ahead...",
    "danger_nearby": "Danger nearby!",
    "safe_for_now": "You're safe... for now.",
    
    // System messages
    "connection_lost": "Connection lost. Trying to reconnect...",
    "connection_restored": "Connection restored!",
    "error_occurred": "An error occurred",
    "restart_required": "Restart required",
    "saving_progress": "Saving progress...",
    "progress_saved": "Progress saved!",
    
    // Misc
    "yes": "Yes",
    "no": "No",
    "ok": "OK",
    "cancel": "Cancel",
    "close": "Close",
    "back": "Back",
    "next": "Next",
    "continue": "Continue",
    
    // Additional translation keys for UI elements
    "auth_message_warning": "WARNING: You are about to access an unauthorized network.\n\nThis terminal serves as an interface to the internal communications of THE-DEPTHS group.\nAny unauthorized intrusion will be traced and reported to administrators.\n\nThis access is only intended for confirmed members.",
    "auth_progress": "Progress towards authentication",
    "progress": "Progress: ",
    "connecting_security": "Connecting to security systems...",
    "auth_locked": "AUTHENTICATION LOCKED",
    "security_warning": "SECURITY SYSTEM: Access to this interface is strictly controlled. External authentication is required to unlock the terminal.",
    "system_offline": "SYSTEM OFFLINE",
    "depths_exploration": "Depths Exploration",
    "loading_experience": "Loading experience...",
    "exploration_details": "Exploration Details",
    "start": "START",
    "end": "END",
    "participation_message": "Your participation stabilizes the connection and reveals new mysteries",
    
    // Message log translations
    "journal_des_messages": "Message Log",
    "aucun_evenement": "No events recorded",
    "message": "Message",
    "bienvenue_profondeurs": "Welcome to The Depths",
    "explorez_tunnels": "Explore the tunnels for clues",
    "attention_entites": "Beware of mysterious entities",
    "bienvenue_portes": "Welcome to The Depths. The doors hide secrets. It's up to you to discover them...",
    "connecte_serveur": "Connected to command server",
    "indice_decouvert": "Hint discovered",
    "evenement": "Event",
    "apparition_mysterieuse": "Mysterious apparition",
    "blackout_soudain": "Sudden blackout",
    "distorsion_realite": "Reality distortion",
    "porte_ouvre": "Door opening",
    "vote_communautaire": "Community vote",
    "progression": "Progress",
    "decouverte": "Discovery",
    "systeme": "System",
    
    // Leaderboard and Top 100 translations
    "classement_explorateurs": "Explorer Ranking",
    "top_100_explorateurs": "Top 100 Explorers",
    "aucun_donateur": "No donors yet",
    "explorateur": "Explorer",
    "chercheur": "Researcher",
    "eclaireur": "Scout",
    "illumine": "Illuminated",
    "units": "units",
    
    // Vote panel translations
    "vote_communautaire_titre": "Community Vote",
    "vote_question_portes": "Which door should the traveler open next?",
    "porte_symbole_spirale": "Door with spiral symbol",
    "porte_rouge_clignotante": "Flashing red door",
    "porte_marques_griffes": "Door with claw marks",
    "vote_interaction": "Your interaction counts as a vote. Ends in"
};

/**
 * Function to translate a key to English
 * @param {string} key - The translation key
 * @returns {string} The translated text
 */
function translateToEnglish(key) {
    return englishTranslations[key] || key;
}

/**
 * Initialize English translations
 */
function initializeEnglishTranslations() {
    // Make the translation function available globally
    window.translateToEnglish = translateToEnglish;
    
    // Make this function available to be called by changeLanguage
    window.initializeEnglishTranslations = initializeEnglishTranslations;
    
    console.log("English translations initialized");
}

// Initialize translations when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEnglishTranslations); 