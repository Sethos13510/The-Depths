# Sethos AI - Système Unifié

Ce projet est une application complète pour Sethos AI, combinant plusieurs fonctionnalités dans un système unifié.

## Structure du projet

```
launcher/
├── js-unified/           # Scripts JavaScript unifiés
│   ├── unified_server.js # Serveur central (combine tous les serveurs)
│   ├── unified_socket.js # Gestionnaire de connexions Socket.IO 
│   ├── unified_fixes.js  # Correctifs JavaScript unifiés
│   └── data_manager.js   # Gestionnaire de données unifié
├── css-unified/          # Styles CSS unifiés
├── new_admin.html        # Interface d'administration
├── sethos_ai.html        # Interface TikTok
└── package.json          # Configuration des dépendances
```

## Installation

1. Assurez-vous d'avoir Node.js installé (v14 ou supérieur)
2. Installez les dépendances : `npm install`

## Démarrage

Utilisez une des commandes suivantes :

- `npm start` : Démarrer le serveur unifié complet
- `npm run tiktok` : Démarrer uniquement le serveur TikTok
- `npm run dev` : Démarrer en mode développement (avec redémarrage automatique)

Ou utilisez le fichier `sethos.bat` pour un menu interactif sous Windows.

## Utilisation

- Interface d'administration : http://localhost:3333/new_admin.html
- Interface TikTok : http://localhost:3333/sethos_ai.html
- API TikTok : http://localhost:8092/

## Système de données

Toutes les données sont maintenant stockées dans un format unifié qui inclut :
- Donations
- Authentification
- Événements de l'histoire
- Statistiques TikTok
- Configurations système 