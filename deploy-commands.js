// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Charger automatiquement toutes les commandes depuis le dossier commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Commande chargée: ${command.data.name}`);
  } else {
    console.log(`⚠️ Commande manquante propriété "data" ou "execute": ${file}`);
  }
}

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