const express = require('express');
const { ROLE_CONFIG } = require('../config/roleConfig');

function createStatusRoutes(client) {
  const router = express.Router();

  // Route de test pour vérifier que le bot fonctionne
  router.get('/test', (req, res) => {
    res.json({ 
      status: 'Bot Discord actif',
      user: client.user?.tag || 'Non connecté',
      timestamp: new Date().toISOString(),
      roleSystem: {
        roleName: ROLE_CONFIG.PROJECT_ROLE_NAME,
        emoji: ROLE_CONFIG.REACTION_EMOJI,
        channelConfigured: !!ROLE_CONFIG.PROJECT_ANNOUNCE_CHANNEL_ID
      }
    });
  });

  // Route de santé du service
  router.get('/health', (req, res) => {
    const isReady = client.isReady();
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'healthy' : 'unhealthy',
      bot: {
        ready: isReady,
        user: client.user?.tag,
        uptime: client.uptime,
        guilds: client.guilds.cache.size
      },
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

module.exports = createStatusRoutes;