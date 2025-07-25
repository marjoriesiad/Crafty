// deploy-commands.js
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  // Commande existante
  new SlashCommandBuilder()
    .setName('infos')
    .setDescription('Affiche les stats du site SkillCraft')
    .toJSON(),
    
  // ✨ NOUVELLE COMMANDE pour setup des rôles
  new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('Créer le message de rôle pour les notifications de projets')
    .setDefaultMemberPermissions('0') // Seuls les admins peuvent utiliser cette commande
    .toJSON(),

  // ✨ NOUVELLE COMMANDE pour obtenir des infos sur les rôles
  new SlashCommandBuilder()
    .setName('role-stats')
    .setDescription('Affiche les statistiques du système de rôles')
    .setDefaultMemberPermissions('0') // Admin seulement
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('🛠️ Déploiement des commandes slash...');
    console.log(`📋 ${commands.length} commande(s) à déployer :`);
    commands.forEach((cmd, index) => {
      console.log(`   ${index + 1}. /${cmd.name} - ${cmd.description}`);
    });
    
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    
    console.log('✅ Toutes les commandes ont été déployées avec succès !');
    console.log('');
    console.log('📝 Commandes disponibles :');
    console.log('   • /infos - Afficher les stats du site');
    console.log('   • /setup-roles - Créer le système de rôles (admin)');
    console.log('   • /role-stats - Statistiques des rôles (admin)');
    console.log('');
    console.log('🚀 Vous pouvez maintenant les utiliser sur Discord !');
    
  } catch (error) {
    console.error('❌ Erreur lors du déploiement :', error);
    process.exit(1);
  }
})();