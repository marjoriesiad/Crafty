const { EmbedBuilder } = require('discord.js');
const { ROLE_CONFIG } = require('../config/roleConfig');

class RoleService {
  constructor(client) {
    this.client = client;
  }

  // Fonction pour créer/récupérer le rôle
  async ensureProjectRole(guild) {
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
  async setupRoleMessage() {
    try {
      const channelId = ROLE_CONFIG.SETUP_CHANNEL_ID || ROLE_CONFIG.PROJECT_ANNOUNCE_CHANNEL_ID;
      if (!channelId) {
        console.error('❌ Aucun canal configuré pour le setup des rôles');
        return false;
      }

      const channel = await this.client.channels.fetch(channelId);
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
          iconURL: this.client.user.displayAvatarURL()
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
  async getRoleMention(guild) {
    try {
      const role = guild.roles.cache.find(r => r.name === ROLE_CONFIG.PROJECT_ROLE_NAME);
      return role ? `<@&${role.id}>` : '';
    } catch (error) {
      console.error('❌ Erreur récupération rôle pour mention:', error);
      return '';
    }
  }

  // Ajouter un rôle à un utilisateur
  async addRoleToUser(member, role) {
    try {
      if (member.roles.cache.has(role.id)) {
        console.log(`ℹ️ ${member.user.username} a déjà le rôle ${ROLE_CONFIG.PROJECT_ROLE_NAME}`);
        return false;
      }

      await member.roles.add(role);
      console.log(`✅ Rôle "${ROLE_CONFIG.PROJECT_ROLE_NAME}" ajouté à ${member.user.username}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du rôle:', error);
      return false;
    }
  }

  // Retirer un rôle d'un utilisateur
  async removeRoleFromUser(member, role) {
    try {
      if (!member.roles.cache.has(role.id)) {
        console.log(`ℹ️ ${member.user.username} n'a pas le rôle ${ROLE_CONFIG.PROJECT_ROLE_NAME}`);
        return false;
      }

      await member.roles.remove(role);
      console.log(`➖ Rôle "${ROLE_CONFIG.PROJECT_ROLE_NAME}" retiré de ${member.user.username}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du retrait du rôle:', error);
      return false;
    }
  }
}

// Export des fonctions standalone pour compatibilité
async function setupRoleMessage() {
  // Cette fonction sera appelée depuis l'extérieur, on utilise une instance temporaire
  console.error('⚠️ setupRoleMessage appelée sans instance de RoleService. Utilisez roleService.setupRoleMessage() à la place.');
  return false;
}

module.exports = RoleService;
module.exports.setupRoleMessage = setupRoleMessage;