const { EmbedBuilder } = require('discord.js');
const { formatDifficulty, formatStatus, getStatusColor, getDisplayName } = require('../utils/formatters');

class ProjectService {
  constructor(client, roleService) {
    this.client = client;
    this.roleService = roleService;
  }

  // Fonction pour annoncer un nouveau projet
  async announceProject(projectData, channelId) {
    try {
      // Validation des données minimales requises
      if (!projectData.title || !projectData.creator) {
        throw new Error('Données manquantes (title et creator requis)');
      }

      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error('Salon Discord non trouvé');
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
      const roleMention = await this.roleService.getRoleMention(channel.guild);
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
      return { success: true, message: 'Annonce envoyée avec succès' };

    } catch (error) {
      console.error('❌ Erreur lors de l\'annonce du projet:', error);
      throw error;
    }
  }

  // Fonction pour annoncer une mise à jour de projet
  async announceProjectUpdate(projectData, updateType = 'general', channelId) {
    try {
      if (!projectData.title || !projectData.creator) {
        throw new Error('Données manquantes');
      }

      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error('Salon Discord non trouvé');
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
        const roleMention = await this.roleService.getRoleMention(channel.guild);
        if (roleMention) {
          messageContent = `${roleMention} Félicitations pour ce projet terminé ! 🎉`;
        }
      }

      await channel.send({ 
        embeds: [embed],
        content: messageContent
      });

      console.log(`✅ Mise à jour envoyée pour le projet: ${projectData.title}`);
      return { success: true, message: 'Mise à jour annoncée' };

    } catch (error) {
      console.error('❌ Erreur mise à jour:', error);
      throw error;
    }
  }
}

module.exports = ProjectService;