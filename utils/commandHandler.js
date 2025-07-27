const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor() {
    this.commands = new Map();
  }

  // Charger toutes les commandes depuis le dossier commands
  async loadCommands(commandsPath) {
    try {
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          this.commands.set(command.data.name, command);
          console.log(`✅ Commande chargée: ${command.data.name}`);
        } else {
          console.log(`⚠️ Commande manquante propriété "data" ou "execute": ${file}`);
        }
      }
      
      console.log(`🎯 ${this.commands.size} commande(s) chargée(s)`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes:', error);
    }
  }

  // Exécuter une commande
  async executeCommand(interaction) {
    const command = this.commands.get(interaction.commandName);
    
    if (!command) {
      console.error(`❌ Commande non trouvée: ${interaction.commandName}`);
      return false;
    }

    try {
      await command.execute(interaction);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'exécution de ${interaction.commandName}:`, error);
      
      // Répondre avec un message d'erreur générique
      const errorMessage = '❌ Une erreur est survenue lors de l\'exécution de cette commande.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
      
      return false;
    }
  }

  // Obtenir la liste des commandes chargées
  getCommands() {
    return Array.from(this.commands.values()).map(command => command.data);
  }

  // Vérifier si une commande existe
  hasCommand(commandName) {
    return this.commands.has(commandName);
  }
}

module.exports = CommandHandler;