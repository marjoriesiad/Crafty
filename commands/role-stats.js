const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { ROLE_CONFIG } = require('../config/roleConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-stats')
    .setDescription('Affiche les statistiques du système de rôles')
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
  },
};