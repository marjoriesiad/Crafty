const { EmbedBuilder } = require('discord.js');
const { ROLE_CONFIG } = require('../config/roleConfig');

// Fonctions utilitaires pour les messages et embeds

function createRoleConfirmationEmbed(action = 'added') {
  const isAdded = action === 'added';
  
  return new EmbedBuilder()
    .setTitle(isAdded ? '🎉 Rôle ajouté avec succès !' : '👋 Rôle retiré')
    .setDescription(
      isAdded 
        ? `Vous avez maintenant le rôle **${ROLE_CONFIG.PROJECT_ROLE_NAME}** !`
        : `Le rôle **${ROLE_CONFIG.PROJECT_ROLE_NAME}** a été retiré de votre compte.`
    )
    .setColor(isAdded ? '#2ecc71' : '#e74c3c')
    .addFields(
      { 
        name: isAdded ? '✅ Ce que cela signifie' : '📭 Ce que cela signifie', 
        value: isAdded 
          ? '• Vous serez mentionné à chaque nouveau projet\n• Vous recevrez les notifications en temps réel\n• Vous pourrez découvrir de nouveaux projets rapidement'
          : '• Vous ne recevrez plus de notifications pour les nouveaux projets\n• Vous pouvez le remettre à tout moment', 
        inline: false 
      },
      { 
        name: '🔄 Pour ' + (isAdded ? 'retirer' : 'remettre') + ' ce rôle', 
        value: isAdded 
          ? `Retirez simplement votre réaction ${ROLE_CONFIG.REACTION_EMOJI} sur le message`
          : `Cliquez à nouveau sur ${ROLE_CONFIG.REACTION_EMOJI} sur le message de configuration`, 
        inline: false 
      }
    )
    .setFooter({ text: 'SkillCraft - Notifications' })
    .setTimestamp();
}

async function sendPrivateMessage(user, embed) {
  try {
    await user.send({ embeds: [embed] });
    return true;
  } catch (dmError) {
    // L'utilisateur a peut-être désactivé les MPs
    console.log(`ℹ️ Impossible d'envoyer un MP à ${user.username} (MPs désactivés)`);
    return false;
  }
}

module.exports = {
  createRoleConfirmationEmbed,
  sendPrivateMessage
};