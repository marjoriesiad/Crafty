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

  // Route pour les stats Discord demandées par le site web
  router.get('/api/discord/stats', async (req, res) => {
    try {
      if (!client.isReady()) {
        return res.status(503).json({
          error: 'Bot Discord non connecté',
          memberCount: 0,
          onlineCount: 0,
          name: 'SkillCraft Community',
          description: 'Bot temporairement hors ligne'
        });
      }

      // Récupérer le serveur Discord principal
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      
      if (!guild) {
        return res.status(404).json({
          error: 'Serveur Discord non trouvé',
          memberCount: 0,
          onlineCount: 0,
          name: 'SkillCraft Community',
          description: 'Serveur non configuré'
        });
      }

      // Récupérer les stats du serveur
      const memberCount = guild.memberCount;
      const onlineCount = guild.members.cache.filter(member => 
        member.presence?.status === 'online' || 
        member.presence?.status === 'idle' || 
        member.presence?.status === 'dnd'
      ).size;

      const stats = {
        memberCount: memberCount,
        onlineCount: onlineCount,
        name: guild.name,
        description: guild.description || 'Communauté de développeurs SkillCraft',
        icon: guild.iconURL()
      };

      res.json(stats);

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stats Discord:', error);
      res.status(500).json({
        error: 'Erreur interne du serveur',
        memberCount: 0,
        onlineCount: 0,
        name: 'SkillCraft Community',
        description: 'Erreur lors de la récupération des stats'
      });
    }
  });

  return router;
}

module.exports = createStatusRoutes;