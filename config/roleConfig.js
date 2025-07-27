// Configuration du système de rôles

const ROLE_CONFIG = {
  PROJECT_ROLE_NAME: 'Guetteur de Quêtes', // Nom du rôle à attribuer
  REACTION_EMOJI: '🔔', // Emoji pour les réactions
  SETUP_CHANNEL_ID: process.env.SETUP_CHANNEL_ID, // Canal pour le message de setup
  PROJECT_ANNOUNCE_CHANNEL_ID: process.env.PROJECT_ANNOUNCE_CHANNEL_ID // Canal des annonces
};

module.exports = {
  ROLE_CONFIG
};