const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// === Configuration Express ===
const app = express();
app.use(bodyParser.json());

// === Configuration Discord ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions, // Pour les réactions
    GatewayIntentBits.GuildMembers // Pour gérer les rôles
  ],
});

// === Configuration du système de rôles ===
const ROLE_CONFIG = {
  PROJECT_ROLE_NAME: 'Projets', // Nom du rôle à attribuer
  REACTION_EMOJI: '🔔', // Emoji pour les réactions
  SETUP_CHANNEL_ID: process.env.SETUP_CHANNEL_ID, // Canal pour le message de setup
  PROJECT_ANNOUNCE_CHANNEL_ID: process.env.PROJECT_ANNOUNCE_CHANNEL_ID // Canal des annonces
};

// === Bot Discord - Événements ===
client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  console.log(`🔔 Système de rôles configuré avec l'emoji ${ROLE_CONFIG.REACTION_EMOJI}`);
  console.log(`🎯 Rôle configuré : ${ROLE_CONFIG.PROJECT_ROLE_NAME}`);
  
  // Optionnel : Créer automatiquement le message de rôle au démarrage
  if (process.env.AUTO_SETUP_ROLES === 'true') {
    console.log('🚀 Configuration automatique des rôles...');
    await setupRoleMessage();
  }
});

// === Système de rôles automatique ===

// Fonction pour créer/récupérer le rôle
async function ensureProjectRole(guild) {
  try {
    // Chercher le rôle existant
    let role = guild.roles.cache.find(r => r.name === ROLE_CONFIG.PROJECT_ROLE_NAME);
    
    // Créer le rôle s'il n'existe pas
    if (!role) {
      role = await guild.roles.create({
        name: ROLE_CONFIG.PROJECT_ROLE_NAME,
        color: '#3498db', // Bleu
        reason: 'Rôle automatique pour les notifications de projets SkillCraft',
        mentionable: true, // Permet de mentionner le rôle
        permissions: [] // Aucune permission spéciale
      });
      console.log(`✅ Rôle "${ROLE_CONFIG.PROJECT_ROLE_NAME}" créé avec succès`);
    }
    
    return role;
  } catch (error) {
    console.error('❌ Erreur lors de la création du rôle:', error);
    return null;
  }
}

// Fonction pour créer le message de setup des rôles
async function setupRoleMessage() {
  try {
    const channelId = ROLE_CONFIG.SETUP_CHANNEL_ID || ROLE_CONFIG.PROJECT_ANNOUNCE_CHANNEL_ID;
    if (!channelId) {
      console.error('❌ Aucun canal configuré pour le setup des rôles');
      return false;
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error('❌ Canal non trouvé pour le setup des rôles');
      return false;
    }

    // Créer l'embed pour le message de rôle
    const embed = new EmbedBuilder()
      .setTitle('🔔 Notifications de Projets SkillCraft')
      .setDescription(`Restez informé des nouveaux projets créés sur SkillCraft !
      
**Comment ça marche ?**
• Cliquez sur ${ROLE_CONFIG.REACTION_EMOJI} ci-dessous pour recevoir le rôle **${ROLE_CONFIG.PROJECT_ROLE_NAME}**
• Vous serez mentionné à chaque nouveau projet publié
• Recliquez sur ${ROLE_CONFIG.REACTION_EMOJI} pour retirer le rôle à tout moment

**Avantages :**
🚀 Soyez le premier informé des nouveaux projets
🎯 Trouvez rapidement des projets qui vous intéressent  
👥 Rejoignez des équipes talentueuses
💡 Découvrez de nouvelles technologies

**Projet SkillCraft :**
Plateforme collaborative pour développeurs où vous pouvez créer, rejoindre et développer des projets ensemble !`)
      .setColor('#3498db')
      .setFooter({ 
        text: 'Crafty • Système de notifications automatique',
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    // Envoyer le message
    const message = await channel.send({ 
      embeds: [embed],
      content: `**🎯 Système de notifications des projets**\n\nCliquez sur ${ROLE_CONFIG.REACTION_EMOJI} ci-dessous pour recevoir les notifications !`
    });

    // Ajouter la réaction
    await message.react(ROLE_CONFIG.REACTION_EMOJI);
    
    console.log(`✅ Message de rôle créé dans #${channel.name}`);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du setup du message de rôle:', error);
    return false;
  }
}

// Fonction pour obtenir la mention du rôle
async function getRoleMention(guild) {
  try {
    const role = guild.roles.cache.find(r => r.name === ROLE_CONFIG.PROJECT_ROLE_NAME);
    return role ? `<@&${role.id}>` : '';
  } catch (error) {
    console.error('❌ Erreur récupération rôle pour mention:', error);
    return '';
  }
}

// === Gestion des réactions ===

// Gestion des réactions ajoutées
client.on('messageReactionAdd', async (reaction, user) => {
  try {
    // Ignorer les réactions du bot lui-même
    if (user.bot) return;

    // Vérifier si c'est la bonne réaction
    if (reaction.emoji.name !== ROLE_CONFIG.REACTION_EMOJI) return;

    // Récupérer le membre
    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    // Récupérer ou créer le rôle
    const role = await ensureProjectRole(reaction.message.guild);
    if (!role) {
      console.error('❌ Impossible de récupérer le rôle');
      return;
    }

    // Vérifier si le membre a déjà le rôle
    if (member.roles.cache.has(role.id)) {
      console.log(`ℹ️ ${user.username} a déjà le rôle ${ROLE_CONFIG.PROJECT_ROLE_NAME}`);
      return;
    }

    // Ajouter le rôle
    await member.roles.add(role);
    console.log(`✅ Rôle "${ROLE_CONFIG.PROJECT_ROLE_NAME}" ajouté à ${user.username}`);

    // Envoyer un message privé de confirmation
    try {
      const confirmEmbed = new EmbedBuilder()
        .setTitle('🎉 Rôle ajouté avec succès !')
        .setDescription(`Vous avez maintenant le rôle **${ROLE_CONFIG.PROJECT_ROLE_NAME}** !`)
        .setColor('#2ecc71')
        .addFields(
          { 
            name: '✅ Ce que cela signifie', 
            value: '• Vous serez mentionné à chaque nouveau projet\n• Vous recevrez les notifications en temps réel\n• Vous pourrez découvrir de nouveaux projets rapidement', 
            inline: false 
          },
          { 
            name: '🔄 Pour retirer ce rôle', 
            value: `Retirez simplement votre réaction ${ROLE_CONFIG.REACTION_EMOJI} sur le message`, 
            inline: false 
          }
        )
        .setFooter({ text: 'SkillCraft - Notifications' })
        .setTimestamp();

      await user.send({ embeds: [confirmEmbed] });
    } catch (dmError) {
      // L'utilisateur a peut-être désactivé les MPs
      console.log(`ℹ️ Impossible d'envoyer un MP à ${user.username} (MPs désactivés)`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du rôle:', error);
  }
});

// Gestion des réactions retirées
client.on('messageReactionRemove', async (reaction, user) => {
  try {
    // Ignorer les réactions du bot lui-même
    if (user.bot) return;

    // Vérifier si c'est la bonne réaction
    if (reaction.emoji.name !== ROLE_CONFIG.REACTION_EMOJI) return;

    // Récupérer le membre
    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    // Récupérer le rôle
    const role = reaction.message.guild.roles.cache.find(r => r.name === ROLE_CONFIG.PROJECT_ROLE_NAME);
    if (!role) {
      console.log(`ℹ️ Rôle ${ROLE_CONFIG.PROJECT_ROLE_NAME} non trouvé`);
      return;
    }

    // Vérifier si le membre a le rôle
    if (!member.roles.cache.has(role.id)) {
      console.log(`ℹ️ ${user.username} n'a pas le rôle ${ROLE_CONFIG.PROJECT_ROLE_NAME}`);
      return;
    }

    // Retirer le rôle
    await member.roles.remove(role);
    console.log(`➖ Rôle "${ROLE_CONFIG.PROJECT_ROLE_NAME}" retiré de ${user.username}`);

    // Message de confirmation en MP
    try {
      const confirmEmbed = new EmbedBuilder()
        .setTitle('👋 Rôle retiré')
        .setDescription(`Le rôle **${ROLE_CONFIG.PROJECT_ROLE_NAME}** a été retiré de votre compte.`)
        .setColor('#e74c3c')
        .addFields(
          { 
            name: '📭 Ce que cela signifie', 
            value: '• Vous ne recevrez plus de notifications pour les nouveaux projets\n• Vous pouvez le remettre à tout moment', 
            inline: false 
          },
          { 
            name: '🔄 Pour remettre ce rôle', 
            value: `Cliquez à nouveau sur ${ROLE_CONFIG.REACTION_EMOJI} sur le message de configuration`, 
            inline: false 
          }
        )
        .setFooter({ text: 'SkillCraft - Notifications' })
        .setTimestamp();

      await user.send({ embeds: [confirmEmbed] });
    } catch (dmError) {
      console.log(`ℹ️ Impossible d'envoyer un MP à ${user.username} (MPs désactivés)`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du retrait du rôle:', error);
  }
});

// === Gestion des commandes slash ===
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // Commande /infos existante
  if (commandName === 'infos') {
    try {
      const command = require('./infos.js');
      await command.execute(interaction);
    } catch (error) {
      console.error('❌ Erreur /infos:', error);
      await interaction.reply({ 
        content: '❌ Erreur lors de l\'exécution de la commande.', 
        ephemeral: true 
      });
    }
  }

  // Commande /setup-roles
  if (commandName === 'setup-roles') {
    try {
      // Vérifier les permissions
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return await interaction.reply({
          content: '❌ Vous devez avoir la permission "Gérer les rôles" pour utiliser cette commande.',
          ephemeral: true
        });
      }

      await interaction.deferReply();
      
      const success = await setupRoleMessage();
      
      if (success) {
        await interaction.editReply('✅ Message de rôle créé avec succès ! Les utilisateurs peuvent maintenant cliquer sur 🔔 pour recevoir les notifications.');
      } else {
        await interaction.editReply('❌ Erreur lors de la création du message de rôle. Vérifiez la configuration et les permissions.');
      }
    } catch (error) {
      console.error('❌ Erreur setup-roles:', error);
      await interaction.editReply('❌ Erreur lors de la création du message de rôle.');
    }
  }

  // Commande /role-stats
  if (commandName === 'role-stats') {
    try {
      // Vérifier les permissions
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return await interaction.reply({
          content: '❌ Vous devez avoir la permission "Gérer les rôles" pour utiliser cette commande.',
          ephemeral: true
        });
      }

      await interaction.deferReply();

      const guild = interaction.guild;
      const role = guild.roles.cache.find(r => r.name === ROLE_CONFIG.PROJECT_ROLE_NAME);
      
      if (!role) {
        return await interaction.editReply('❌ Le rôle "Projets" n\'existe pas encore. Utilisez `/setup-roles` d\'abord.');
      }

      const membersWithRole = role.members.size;
      const totalMembers = guild.memberCount;
      const percentage = totalMembers > 0 ? ((membersWithRole / totalMembers) * 100).toFixed(1) : '0.0';

      const embed = new EmbedBuilder()
        .setTitle('📊 Statistiques du Système de Rôles')
        .setDescription('Voici les informations sur le système de notifications SkillCraft')
        .setColor('#3498db')
        .addFields(
          { name: '👥 Membres avec le rôle', value: `${membersWithRole}`, inline: true },
          { name: '🏠 Total membres serveur', value: `${totalMembers}`, inline: true },
          { name: '📈 Pourcentage', value: `${percentage}%`, inline: true },
          { name: '🎯 Nom du rôle', value: `\`${role.name}\``, inline: true },
          { name: '🔔 Emoji utilisé', value: ROLE_CONFIG.REACTION_EMOJI, inline: true },
          { name: '🆔 ID du rôle', value: `\`${role.id}\``, inline: true },
          { name: '🎨 Couleur du rôle', value: `${role.hexColor}`, inline: true },
          { name: '📅 Rôle créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`, inline: true },
          { name: '💬 Mentionnable', value: role.mentionable ? '✅ Oui' : '❌ Non', inline: true }
        )
        .setFooter({ text: 'Système de notifications SkillCraft' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      console.error('❌ Erreur role-stats:', error);
      await interaction.editReply('❌ Erreur lors de la récupération des statistiques.');
    }
  }
});

// === Fonctions utilitaires pour les projets ===
function getDisplayName(user) {
  if (user.username) return user.username;
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return 'Utilisateur anonyme';
}

function formatDifficulty(difficulty) {
  const difficulties = {
    'BEGINNER': '🟢 Débutant',
    'INTERMEDIATE': '🟡 Intermédiaire',
    'ADVANCED': '🔴 Avancé'
  };
  return difficulties[difficulty] || difficulty;
}

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

// === Middleware d'authentification ===
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

// === Routes API pour les notifications de projets ===

// Route pour annoncer un nouveau projet
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
      .setTitle('🚀 Nouveau projet forgé, il est pour toi celui-là!')
      .setDescription(`**${projectData.title}**\n${projectData.shortDesc || projectData.description?.substring(0, 150) + '...' || 'Aucune description'}`)
      .setColor(getStatusColor(projectData.status || 'PLANNING'))
      .setTimestamp(new Date(projectData.createdAt || Date.now()))
      .setFooter({ 
        text: `ID: ${projectData.id || 'N/A'}`,
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

    // Technologies
    if (projectData.technologies && projectData.technologies.length > 0) {
      const techNames = projectData.technologies
        .slice(0, 8) // Limiter pour éviter les messages trop longs
        .map(tech => {
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

    // Lien vers le projet pour rejoindre
    const projectUrl = `${process.env.SKILLCRAFT_URL || 'https://skillcraft.dev'}/projects/${projectData.id}`;
    
    embed.addFields({
      name: '🎯 Rejoindre le projet',
      value: `[👉 Cliquez ici pour rejoindre !](${projectUrl})`,
      inline: false
    });

    // Ajouter une image si disponible
    if (projectData.image) {
      embed.setThumbnail(projectData.image);
    }

    // Récupérer la mention du rôle
    const roleMention = await getRoleMention(channel.guild);
    let messageContent = isOpen ? '🎯 **Rejoignez cette aventure !**' : '🎯 **Nouveau projet disponible !**';
    
    if (roleMention) {
      messageContent += `\n\n${roleMention} Un nouveau projet vous attend ! 🚀`;
    }

    // Envoyer le message avec l'embed
    await channel.send({ 
      embeds: [embed],
      content: messageContent
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

// Route pour annoncer une mise à jour de projet
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

    // Lien vers le projet
    const projectUrl = `${process.env.SKILLCRAFT_URL || 'https://skillcraft.dev'}/projects/${projectData.id}`;
    embed.addFields({
      name: '🎯 Voir le projet',
      value: `[👉 Cliquez ici](${projectUrl})`,
      inline: false
    });

    // Mentionner le rôle pour les mises à jour importantes
    let messageContent = '';
    if (updateType === 'completed') {
      const roleMention = await getRoleMention(channel.guild);
      if (roleMention) {
        messageContent = `${roleMention} Félicitations pour ce projet terminé ! 🎉`;
      }
    }

    await channel.send({ 
      embeds: [embed],
      content: messageContent
    });

    console.log(`✅ Mise à jour envoyée pour le projet: ${projectData.title}`);
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
    timestamp: new Date().toISOString(),
    roleSystem: {
      roleName: ROLE_CONFIG.PROJECT_ROLE_NAME,
      emoji: ROLE_CONFIG.REACTION_EMOJI,
      channelConfigured: !!ROLE_CONFIG.PROJECT_ANNOUNCE_CHANNEL_ID
    }
  });
});

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
client.login(process.env.BOT_TOKEN)
  .then(() => {
    app.listen(3001, () => {
      console.log('🌐 Serveur API en écoute sur le port 3001');
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