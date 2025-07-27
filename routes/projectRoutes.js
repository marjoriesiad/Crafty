const express = require('express');
const { authenticateRequest } = require('../utils/auth');
const { BOT_CONFIG } = require('../config/botConfig');

function createProjectRoutes(projectService) {
  const router = express.Router();

  // Route pour annoncer un nouveau projet
  router.post('/announce-project', authenticateRequest, async (req, res) => {
    try {
      const projectData = req.body;
      
      // Validation des données minimales requises
      if (!projectData.title || !projectData.creator) {
        return res.status(400).json({ 
          error: 'Données manquantes (title et creator requis)' 
        });
      }

      const channelId = process.env.PROJECT_ANNOUNCE_CHANNEL_ID;
      if (!channelId) {
        return res.status(500).json({ error: 'Canal d\'annonces non configuré' });
      }

      const result = await projectService.announceProject(projectData, channelId);
      res.status(200).json(result);

    } catch (error) {
      console.error('❌ Erreur lors de l\'annonce du projet:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur',
        details: error.message 
      });
    }
  });

  // Route pour annoncer une mise à jour de projet
  router.post('/announce-project-update', authenticateRequest, async (req, res) => {
    try {
      const { projectData, updateType = 'general' } = req.body;
      
      if (!projectData.title || !projectData.creator) {
        return res.status(400).json({ 
          error: 'Données manquantes' 
        });
      }

      const channelId = process.env.PROJECT_ANNOUNCE_CHANNEL_ID;
      if (!channelId) {
        return res.status(500).json({ error: 'Canal d\'annonces non configuré' });
      }

      const result = await projectService.announceProjectUpdate(projectData, updateType, channelId);
      res.status(200).json(result);

    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      res.status(500).json({ 
        error: 'Erreur interne du serveur' 
      });
    }
  });

  return router;
}

module.exports = createProjectRoutes;