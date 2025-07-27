# Utilise une image Node officielle
FROM node:18

# Crée un dossier dans le conteneur pour ton bot
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste
COPY . .

# Ajoute les variables d'environnement
ENV NODE_ENV=production

# Lance le bot
CMD ["npm", "run", "start"]
