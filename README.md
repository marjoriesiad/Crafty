# Crafty Bot - Bot Discord SkillCraft

Bot Discord pour la gestion des notifications de projets SkillCraft avec système de rôles automatique.

## 🏗️ Structure du Projet

```
Crafty/
├── index.js                 # Point d'entrée principal
├── deploy-commands.js       # Déploiement des commandes slash
├── package.json            # Dépendances et scripts
├── commands/               # Commandes slash Discord
│   ├── infos.js           # Statistiques du site
│   ├── role-stats.js      # Statistiques des rôles
│   └── setup-roles.js     # Configuration des rôles
├── services/               # Logique métier
│   ├── roleService.js     # Gestion des rôles
│   └── projectService.js  # Gestion des projets
├── utils/                  # Utilitaires
│   ├── auth.js            # Authentification API
│   ├── commandHandler.js  # Gestionnaire de commandes
│   ├── formatters.js      # Formatage des données
│   └── messageUtils.js    # Utilitaires de messages
├── config/                 # Configuration
│   ├── botConfig.js       # Configuration générale
│   └── roleConfig.js      # Configuration des rôles
├── events/                 # Gestionnaires d'événements
│   └── reactionHandler.js # Gestion des réactions
└── routes/                 # Routes API Express
    ├── projectRoutes.js   # Routes pour les projets
    └── statusRoutes.js    # Routes de statut
```

## 🚀 Fonctionnalités

### Système de Rôles Automatique
- Attribution automatique de rôles via réactions
- Messages de confirmation en privé
- Gestion des rôles par émojis

### Commandes Slash
- `/infos` - Affiche les statistiques du site SkillCraft
- `/setup-roles` - Configure le système de notifications (admin)
- `/role-stats` - Affiche les statistiques des rôles (admin)

### API REST
- `POST /announce-project` - Annonce un nouveau projet
- `POST /announce-project-update` - Annonce une mise à jour
- `GET /test` - Test de santé du bot
- `GET /health` - Statut détaillé du service

## 🔧 Configuration

### Variables d'environnement requises :
```env
BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
PROJECT_SECRET=your_api_secret
SKILLCRAFT_API_TOKEN=your_skillcraft_token
PROJECT_ANNOUNCE_CHANNEL_ID=channel_id
SETUP_CHANNEL_ID=setup_channel_id (optionnel)
SKILLCRAFT_URL=https://skillcraft.dev
AUTO_SETUP_ROLES=true/false
PORT=3001
```

## 📦 Installation

1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement
4. Déployer les commandes : `node deploy-commands.js`
5. Lancer le bot : `node index.js`

## 🔒 Sécurité

- Authentification par token pour les routes API
- Permissions Discord strictes pour les commandes admin
- Validation des données d'entrée
- Gestion d'erreurs robuste

## 🧪 Tests

Pour tester l'API :
```bash
curl http://localhost:3001/test
```

## 📋 Logs

Le bot affiche des logs détaillés avec émojis pour un suivi facile :
- ✅ Succès
- ❌ Erreurs
- ℹ️ Informations
- ⚠️ Avertissements
- 🚀 Actions importantes

## 🔄 Maintenance

### Ajouter une nouvelle commande :
1. Créer un fichier dans `commands/`
2. Implémenter `data` et `execute`
3. Redéployer avec `node deploy-commands.js`

### Modifier la logique métier :
- Services dans `services/`
- Utilitaires dans `utils/`
- Configuration dans `config/`

## 🐛 Dépannage

- Vérifier les permissions Discord
- Contrôler les variables d'environnement
- Consulter les logs d'erreur
- Tester avec `/test` et `/health`