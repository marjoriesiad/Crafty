const { ROLE_CONFIG } = require('../config/roleConfig');
const { createRoleConfirmationEmbed, sendPrivateMessage } = require('../utils/messageUtils');

class ReactionHandler {
  constructor(client, roleService) {
    this.client = client;
    this.roleService = roleService;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.client.on('messageReactionAdd', this.handleReactionAdd.bind(this));
    this.client.on('messageReactionRemove', this.handleReactionRemove.bind(this));
  }

  async handleReactionAdd(reaction, user) {
    try {
      // Ignorer les réactions du bot lui-même
      if (user.bot) return;

      // Vérifier si c'est la bonne réaction
      if (reaction.emoji.name !== ROLE_CONFIG.REACTION_EMOJI) return;

      // Récupérer le membre
      const member = await reaction.message.guild.members.fetch(user.id);
      if (!member) return;

      // Récupérer ou créer le rôle
      const role = await this.roleService.ensureProjectRole(reaction.message.guild);
      if (!role) {
        console.error('❌ Impossible de récupérer le rôle');
        return;
      }

      // Ajouter le rôle
      const success = await this.roleService.addRoleToUser(member, role);
      if (!success) return;

      // Envoyer un message privé de confirmation
      const confirmEmbed = createRoleConfirmationEmbed('added');
      await sendPrivateMessage(user, confirmEmbed);

    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du rôle:', error);
    }
  }

  async handleReactionRemove(reaction, user) {
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

      // Retirer le rôle
      const success = await this.roleService.removeRoleFromUser(member, role);
      if (!success) return;

      // Message de confirmation en MP
      const confirmEmbed = createRoleConfirmationEmbed('removed');
      await sendPrivateMessage(user, confirmEmbed);

    } catch (error) {
      console.error('❌ Erreur lors du retrait du rôle:', error);
    }
  }
}

module.exports = ReactionHandler;