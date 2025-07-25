const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infos')
    .setDescription('Affiche les stats du site SkillCraft'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await fetch(`https://skillcraft.dev/api/bot/stats?token=${process.env.SKILLCRAFT_API_TOKEN}`);
      if (!response.ok) throw new Error(`Erreur API : ${response.statusText}`);

      const data = await response.json();
      const { users, projects } = data;

      const embed = new EmbedBuilder()
        .setTitle('📊 Statistiques de SkillCraft')
        .setColor('#cd853f') // Terracotta style 🔥
        .addFields(
          { name: '👥 Utilisateurs inscrits', value: `${users}`, inline: true },
          { name: '🛠️ Projets créés', value: `${projects}`, inline: true }
        )
        .setFooter({ text: 'Crafty, fidèle messager du royaume 🛡️' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('❌ Erreur dans /infos :', error);
      await interaction.editReply("❌ Impossible de récupérer les stats du royaume.");
    }
  },
};
