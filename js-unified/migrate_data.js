/**
 * Script de migration pour Sethos AI
 * 
 * Ce script migre toutes les données des anciens fichiers JSON 
 * vers le nouveau format unifié et nettoie les fichiers redondants.
 */

const fs = require('fs');
const path = require('path');
const dataManager = require('./data_manager');

// Définir les chemins des fichiers
const BASE_DIR = path.join(__dirname, '..', '..');
const BACKUP_DIR = path.join(BASE_DIR, 'launcher', 'backups', 'migration_' + Date.now());

// Fichiers à sauvegarder avant suppression
const LEGACY_FILES = [
    'launcher/shared_data.json',
    'launcher/story_data.json',
    'launcher/story_events.json',
    'launcher/tiktok_story_data.json',
    'launcher/latest_auth_progress.json'
];

/**
 * Crée un répertoire de sauvegarde et copie les anciens fichiers
 */
function backupLegacyFiles() {
    console.log('🔄 Sauvegarde des anciens fichiers...');
    
    // Créer le répertoire de sauvegarde
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Copier chaque fichier
    let backupCount = 0;
    
    LEGACY_FILES.forEach(filePath => {
        const fullPath = path.join(BASE_DIR, filePath);
        const fileName = path.basename(filePath);
        const destPath = path.join(BACKUP_DIR, fileName);
        
        if (fs.existsSync(fullPath)) {
            try {
                fs.copyFileSync(fullPath, destPath);
                console.log(`✅ Fichier sauvegardé: ${fileName}`);
                backupCount++;
            } catch (error) {
                console.error(`❌ Erreur lors de la sauvegarde de ${fileName}:`, error);
            }
        }
    });
    
    console.log(`🔄 ${backupCount}/${LEGACY_FILES.length} fichiers sauvegardés dans ${BACKUP_DIR}`);
    return backupCount > 0;
}

/**
 * Supprime les fichiers obsolètes après migration
 */
function removeLegacyFiles() {
    console.log('🔄 Suppression des fichiers obsolètes...');
    
    let removeCount = 0;
    
    LEGACY_FILES.forEach(filePath => {
        const fullPath = path.join(BASE_DIR, filePath);
        
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`✅ Fichier supprimé: ${filePath}`);
                removeCount++;
            } catch (error) {
                console.error(`❌ Erreur lors de la suppression de ${filePath}:`, error);
            }
        }
    });
    
    console.log(`🔄 ${removeCount}/${LEGACY_FILES.length} fichiers supprimés`);
    return removeCount;
}

/**
 * Migre les données et affiche les statistiques
 */
function migrateData() {
    console.log('\n🔄 Migration des données vers le format unifié...');
    
    // Initialiser le gestionnaire de données (qui effectue la migration automatiquement)
    const unifiedData = dataManager.initDataManager();
    
    // Afficher les statistiques de migration
    console.log('\n📊 Statistiques de migration:');
    console.log(`- Donations totales: ${unifiedData.donations.total}€`);
    console.log(`- Progression d'authentification: ${unifiedData.auth.progress}/${unifiedData.auth.required}`);
    console.log(`- Événements sauvegardés: ${unifiedData.story.savedEvents.length}`);
    console.log(`- Événements déclenchés: ${unifiedData.story.events.length}`);
    console.log(`- Nombre de paliers: ${unifiedData.thresholds.tiers.length}`);
    
    console.log('\n✅ Migration terminée avec succès!');
    return unifiedData;
}

/**
 * Fonction principale pour exécuter la migration complète
 */
function main() {
    console.log('🚀 Démarrage de la migration des données Sethos AI...');
    
    // Sauvegarder d'abord les fichiers existants
    if (backupLegacyFiles()) {
        // Migrer les données
        const migratedData = migrateData();
        
        // Supprimer les fichiers obsolètes
        const removedCount = removeLegacyFiles();
        
        console.log(`\n✅ Migration terminée! ${removedCount} fichiers nettoyés.`);
        console.log('📂 Une sauvegarde a été créée dans:', BACKUP_DIR);
    } else {
        console.log('⚠️ Aucun fichier à migrer n\'a été trouvé.');
    }
}

// Exécuter la migration
main(); 