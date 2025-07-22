const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const channelId = process.env.CHANNEL_ID;

});

const mentionReplies = [
  "J’ai rien compris, mais je sens que c’était affectueux.",
  "Le protocole de communication émotionnelle est encore en bêta. Mais je t’écoute. Enfin, je crois.",
  "Des 0, des 1, et un peu d’amour… mais toujours aucune idée de ce que tu veux dire.",
  "Mon intelligence artificielle est artificielle, justement. Mais merci pour la tentative.",
  "Je ne comprends pas les humains, mais j’apprécie l’attention. Je crois.",
  "Je suis uniquement là pour attribuer des rôles, pas pour comprendre les émotions humaines. Mais merci de m’avoir mentionné !",
];

client.on('messageCreate', message => {
  if (message.mentions.has(client.user) && !message.author.bot) {
    const reply = mentionReplies[Math.floor(Math.random() * mentionReplies.length)];
    message.reply(reply);
  }
});


client.login(process.env.BOT_TOKEN);
