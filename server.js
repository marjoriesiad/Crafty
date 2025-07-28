const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(bodyParser.json());

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Crafty connecté en tant que ${client.user.tag}`);
});

// Middleware d'authentification
function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token || token !== process.env.PROJECT_SECRET) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }
  next();
}

// Fonction utilitaire pour formater le nom d'affichage
function getDisplayName(user) {
  if (user.username) return user.username;
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return 'Utilisateur anonyme';
}

// Fonction utilitaire pour formater la difficulté
function formatDifficulty(difficulty) {
  const difficulties = {
    'BEGINNER': '🟢 Débutant',
    'INTERMEDIATE': '🟡 Intermédiaire',
    'ADVANCED': '🔴 Avancé'
  };
  return difficulties[difficulty] || difficulty;
}

// Fonction utilitaire pour formater le statut
function formatStatus(status) {
  const statuses = {
    'PLANNING': '📋 Planification',
    'OPEN': '🟢 Ouvert',
    'IN_PROGRESS': '🚀 En cours',
    'COMPLETED': '✅ Terminé',
    'ON_HOLD': '⏸️ En pause',
    'CANCELLED': '❌ Annulé'
  };
  return statuses[status] || status;
}

// Fonction pour obtenir la couleur selon le statut
function getStatusColor(status) {
  const colors = {
    'PLANNING': 0x95a5a6,     // Gris
    'OPEN': 0x2ecc71,        // Vert
    'IN_PROGRESS': 0x3498db, // Bleu
    'COMPLETED': 0x9b59b6,   // Violet
    'ON_HOLD': 0xf39c12,     // Orange
    'CANCELLED': 0xe74c3c    // Rouge
  };
  return colors[status] || 0x95a5a6;
}

// ROUTE pour annoncer un projet avec données complètes
app.post('/announce-project', authenticateRequest, async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validation des données minimales requises
    if (!projectData.title || !projectData.creator) {
      return res.status(400).json({ 
        error: 'Données manquantes (title et creator requis)' 
      });
    }

    const channelId = process.env.PROJECT_ANNOUNCE_CHANNEL_ID;
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Salon Discord non trouvé.' });
    }

    // Créer l'embed Discord
    const embed = new EmbedBuilder()
      .setTitle('🚀 Nouveau projet forgé !')
      .setDescription(`**${projectData.title}**\n${projectData.shortDesc || projectData.description?.substring(0, 150) + '...' || 'Aucune description'}`)
      .setColor(getStatusColor(projectData.status || 'PLANNING'))
      .setTimestamp(new Date(projectData.createdAt || Date.now()))
      .setFooter({ 
        text: `ID: ${projectData.id || 'N/A'}`,
        iconURL: 'https://your-domain.com/favicon.ico' // Optionnel
      });

    // Informations du créateur
    const creatorName = getDisplayName(projectData.creator);
    embed.addFields({
      name: '👤 Créateur',
      value: creatorName,
      inline: true
    });

    // Difficulté
    if (projectData.difficulty) {
      embed.addFields({
        name: '📊 Difficulté',
        value: formatDifficulty(projectData.difficulty),
        inline: true
      });
    }

    // Statut
    embed.addFields({
      name: '🏷️ Statut',
      value: formatStatus(projectData.status || 'PLANNING'),
      inline: true
    });

    // Technologies (depuis les relations)
    if (projectData.technologies && projectData.technologies.length > 0) {
      const techNames = projectData.technologies
        .slice(0, 8) // Limiter pour éviter les messages trop longs
        .map(tech => {
          // Gérer les deux formats possibles
          if (tech.skill) {
            return tech.skill.name;
          }
          return tech.name || tech;
        })
        .join(', ');
      
      embed.addFields({
        name: '💻 Technologies',
        value: techNames + (projectData.technologies.length > 8 ? ` et ${projectData.technologies.length - 8} autres...` : ''),
        inline: false
      });
    }

    // Informations sur l'équipe
    let memberInfo = '';
    if (projectData.members && projectData.members.length > 0) {
      memberInfo = `${projectData.members.length} membre(s)`;
    } else if (projectData.currentMembers) {
      memberInfo = `${projectData.currentMembers} membre(s)`;
    } else {
      memberInfo = '1 membre'; // Au minimum le créateur
    }

    if (projectData.maxMembers) {
      memberInfo += ` / ${projectData.maxMembers} max`;
    }

    // Vérifier si le projet accepte des candidatures
    const isOpen = projectData.status === 'OPEN' || projectData.status === 'PLANNING';
    if (isOpen && (!projectData.maxMembers || (projectData.currentMembers || 1) < projectData.maxMembers)) {
      memberInfo += ' - 🟢 Ouvert aux candidatures';
    }

    embed.addFields({
      name: '👥 Équipe',
      value: memberInfo,
      inline: false
    });

    // Liens (GitHub, demo, etc.)
    const links = [];
    if (projectData.githubUrl) {
      links.push(`[GitHub](${projectData.githubUrl})`);
    }
    if (projectData.liveUrl) {
      links.push(`[Demo](${projectData.liveUrl})`);
    }
    
    if (links.length > 0) {
      embed.addFields({
        name: '🔗 Liens',
        value: links.join(' • '),
        inline: false
      });
    }

    // Ajouter une image si disponible
    if (projectData.image) {
      embed.setThumbnail(projectData.image);
    }

    // Envoyer le message avec l'embed
    await channel.send({ 
      embeds: [embed],
      content: isOpen ? '🎯 **Rejoignez cette aventure !**' : undefined
    });

    console.log(`✅ Annonce envoyée pour le projet: ${projectData.title}`);
    res.status(200).json({ 
      success: true, 
      message: 'Annonce envoyée avec succès' 
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'annonce du projet:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    });
  }
});

// ROUTE pour annoncer une mise à jour de projet
app.post('/announce-project-update', authenticateRequest, async (req, res) => {
  try {
    const { projectData, updateType = 'general' } = req.body;
    
    if (!projectData.title || !projectData.creator) {
      return res.status(400).json({ 
        error: 'Données manquantes' 
      });
    }

    const channelId = process.env.PROJECT_ANNOUNCE_CHANNEL_ID;
    const channel = await client.channels.fetch(channelId);

    if (!channel) {
      return res.status(404).json({ error: 'Salon Discord non trouvé.' });
    }

    const updateTitles = {
      'status': '📊 Projet mis à jour !',
      'members': '👥 Nouvelle recrue !',
      'general': '✏️ Projet mis à jour !',
      'completed': '🎉 Projet terminé !'
    };

    const embed = new EmbedBuilder()
      .setTitle(updateTitles[updateType] || updateTitles.general)
      .setDescription(`**${projectData.title}**\n${projectData.shortDesc || 'Mise à jour du projet'}`)
      .setColor(getStatusColor(projectData.status))
      .setTimestamp()
      .setFooter({ text: `ID: ${projectData.id}` });

    // Informations basiques
    embed.addFields(
      {
        name: '👤 Créateur',
        value: getDisplayName(projectData.creator),
        inline: true
      },
      {
        name: '🏷️ Statut',
        value: formatStatus(projectData.status),
        inline: true
      }
    );

    await channel.send({ embeds: [embed] });

    res.status(200).json({ 
      success: true, 
      message: 'Mise à jour annoncée' 
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// Route de test pour vérifier que le bot fonctionne
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Bot Discord actif',
    user: client.user?.tag || 'Non connecté',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs Discord
client.on('error', (error) => {
  console.error('❌ Erreur Discord:', error);
});

// Lance le serveur HTTP + le bot
client.login(process.env.BOT_TOKEN)
  .then(() => {
    app.listen(3001, '0.0.0.0', () => {
      console.log('🌐 Serveur API de Crafty en écoute sur le port 3001');
      console.log('🤖 Bot Discord Crafty prêt !');
    });
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion Discord:', error);
    process.exit(1);
  });