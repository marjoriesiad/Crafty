const express = require('express');
const bodyParser = require('body-parser');
const { Client, EmbedBuilder } = require('discord.js');
const path = require('path');
require('dotenv').config();

// Configuration imports
const { BOT_CONFIG } = require('./config/botConfig');
const { ROLE_CONFIG } = require('./config/roleConfig');

// Service imports
const RoleService = require('./services/roleService');
const ProjectService = require('./services/projectService');

// Utility imports
const CommandHandler = require('./utils/commandHandler');
const ReactionHandler = require('./events/reactionHandler');
const { authenticateRequest } = require('./utils/auth');

// Route imports
const createProjectRoutes = require('./routes/projectRoutes');
const createStatusRoutes = require('./routes/statusRoutes');

// === Configuration Express ===
const app = express();
app.use(bodyParser.json());

// === Configuration Discord ===
const client = new Client({
  intents: BOT_CONFIG.intents
});

// === Initialisation des services ===
let roleService;
let projectService;
let commandHandler;
let reactionHandler;

// === Bot Discord - Événements ===
client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  console.log(`🔔 Système de rôles configuré avec l'emoji ${ROLE_CONFIG.REACTION_EMOJI}`);
  console.log(`🎯 Rôle configuré : ${ROLE_CONFIG.PROJECT_ROLE_NAME}`);
  
  // Initialiser les services
  roleService = new RoleService(client);
  projectService = new ProjectService(client, roleService);
  
  // Initialiser le gestionnaire de commandes
  commandHandler = new CommandHandler();
  await commandHandler.loadCommands(path.join(__dirname, 'commands'));
  
  // Initialiser le gestionnaire de réactions
  reactionHandler = new ReactionHandler(client, roleService);
  
  // Configuration automatique des rôles si activée
  if (BOT_CONFIG.AUTO_SETUP_ROLES) {
    console.log('🚀 Configuration automatique des rôles...');
    await roleService.setupRoleMessage();
  }
  
  // Configurer les routes une fois que tout est prêt
  if (!routesConfigured) {
    app.use('/', createProjectRoutes(projectService));
    app.use('/', createStatusRoutes(client));
    
    // Route pour les notifications de backup
    app.post('/backup-notification', authenticateRequest, async (req, res) => {
      try {
        const { status, dbName, timestamp, error } = req.body;
        
        if (!status) {
          return res.status(400).json({ error: 'Statut du backup requis' });
        }

        const channelId = '1399513064025620550';
        const channel = await client.channels.fetch(channelId);

        if (!channel) {
          return res.status(404).json({ error: 'Salon Discord non trouvé' });
        }

        // Créer l'embed selon le statut
        const embed = new EmbedBuilder()
          .setTimestamp(timestamp ? new Date(timestamp) : new Date());

        if (status === 'success') {
          embed
            .setTitle('✅ Backup Base de Données Réussi')
            .setDescription(`La sauvegarde de la base de données${dbName ? ` **${dbName}**` : ''} a été effectuée avec succès.`)
            .setColor(0x2ecc71);

          if (dbName) {
            embed.addFields({
              name: '🗄️ Base de données',
              value: dbName,
              inline: true
            });
          }
        } else if (status === 'error') {
          embed
            .setTitle('❌ Échec du Backup Base de Données')
            .setDescription(`La sauvegarde de la base de données${dbName ? ` **${dbName}**` : ''} a échoué.`)
            .setColor(0xe74c3c);

          if (dbName) {
            embed.addFields({
              name: '🗄️ Base de données',
              value: dbName,
              inline: true
            });
          }

          if (error) {
            embed.addFields({
              name: '⚠️ Erreur',
              value: error.substring(0, 1000),
              inline: false
            });
          }
        }

        await channel.send({ embeds: [embed] });

        console.log(`✅ Notification de backup envoyée: ${status}`);
        res.status(200).json({ 
          success: true, 
          message: 'Notification envoyée avec succès' 
        });

      } catch (error) {
        console.error('❌ Erreur lors de la notification de backup:', error);
        res.status(500).json({ 
          error: 'Erreur interne du serveur',
          details: error.message 
        });
      }
    });
    
    routesConfigured = true;
    console.log('✅ Routes API configurées');
  }
});

// === Gestion des commandes slash ===
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (commandHandler) {
    await commandHandler.executeCommand(interaction);
  }
});

// Configuration des routes (après que les services soient initialisés)
let routesConfigured = false;

// Gestion des erreurs Discord
client.on('error', (error) => {
  console.error('❌ Erreur Discord:', error);
});

// Gestion des erreurs de processus
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// === Démarrage du bot et du serveur ===
client.login(BOT_CONFIG.BOT_TOKEN)
  .then(() => {
    app.listen(BOT_CONFIG.EXPRESS_PORT,'0.0.0.0', () => {
      console.log(`🌐 Serveur API en écoute sur le port ${BOT_CONFIG.EXPRESS_PORT}`);
      console.log('🤖 Bot Discord prêt pour les notifications de projets !');
      console.log(`🔔 Système de rôles configuré avec l'emoji ${ROLE_CONFIG.REACTION_EMOJI}`);
      console.log('');
      console.log('📋 Commandes disponibles :');
      console.log('   • /infos - Statistiques du site');
      console.log('   • /setup-roles - Créer le système de rôles');
      console.log('   • /role-stats - Statistiques des rôles');
      console.log('');
      console.log('🚀 Bot prêt à recevoir les notifications !');
    });
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion Discord:', error);
    process.exit(1);
  });