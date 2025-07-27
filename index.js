const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('discord.js');
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