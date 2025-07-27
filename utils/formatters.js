// Fonctions utilitaires pour le formatage des données

function getDisplayName(user) {
  if (user.username) return user.username;
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return 'Utilisateur anonyme';
}

function formatDifficulty(difficulty) {
  const difficulties = {
    'BEGINNER': '🟢 Débutant',
    'INTERMEDIATE': '🟡 Intermédiaire',
    'ADVANCED': '🔴 Avancé'
  };
  return difficulties[difficulty] || difficulty;
}

function formatStatus(status) {
  const statuses = {
    'PLANNING': '📋 Planification',
    'OPEN': '🟢 Ouvert',
    'IN_PROGRESS': '🚀 En cours',
    'COMPLETED': '✅ Terminé',
    'ON_HOLD': '⏸️ En pause',
    'CANCELLED': '❌ Annulé'
  };
  return statuses[status] || status;
}

function getStatusColor(status) {
  const colors = {
    'PLANNING': 0x95a5a6,     // Gris
    'OPEN': 0x2ecc71,        // Vert
    'IN_PROGRESS': 0x3498db, // Bleu
    'COMPLETED': 0x9b59b6,   // Violet
    'ON_HOLD': 0xf39c12,     // Orange
    'CANCELLED': 0xe74c3c    // Rouge
  };
  return colors[status] || 0x95a5a6;
}

module.exports = {
  getDisplayName,
  formatDifficulty,
  formatStatus,
  getStatusColor
};