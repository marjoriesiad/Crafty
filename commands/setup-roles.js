const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Configure le système de notifications pour les projets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      // Vérifier les permissions
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return await interaction.reply({
          content: '❌ Vous devez avoir la permission "Gérer les rôles" pour utiliser cette commande.',
          ephemeral: true
        });
      }

      await interaction.deferReply();
      
      // Cette commande nécessite un accès au roleService qui n'est pas disponible ici
      // Pour l'instant, on indique à l'utilisateur d'utiliser une autre méthode
      await interaction.editReply('❌ Cette commande doit être réimplémentée. Utilisez la configuration automatique ou contactez l\'administrateur.');
    } catch (error) {
      console.error('❌ Erreur setup-roles:', error);
      await interaction.editReply('❌ Erreur lors de la création du message de rôle.');
    }
  },
};