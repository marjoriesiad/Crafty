const { GatewayIntentBits } = require('discord.js');

// Configuration générale du bot Discord

const BOT_CONFIG = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions, // Pour les réactions
    GatewayIntentBits.GuildMembers, // Pour gérer les rôles
    GatewayIntentBits.GuildPresences // Pour voir les statuts en ligne/hors ligne
  ],
  
  // Configuration du serveur Express
  EXPRESS_PORT: process.env.PORT || 3001,
  
  // URLs
  SKILLCRAFT_URL: process.env.SKILLCRAFT_URL || 'https://skillcraft.dev',
  
  // Tokens et secrets
  BOT_TOKEN: process.env.BOT_TOKEN,
  PROJECT_SECRET: process.env.PROJECT_SECRET,
  SKILLCRAFT_API_TOKEN: process.env.SKILLCRAFT_API_TOKEN,
  
  // Options automatiques
  AUTO_SETUP_ROLES: process.env.AUTO_SETUP_ROLES === 'true'
};

module.exports = {
  BOT_CONFIG
};