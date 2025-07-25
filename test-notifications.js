require('dotenv').config();

async function testNotification() {
  console.log('🧪 Test de notification Discord...');
  
  const testData = {
    id: 'test-' + Date.now(),
    title: 'Mon Super Projet de Test',
    shortDesc: 'Un projet de test pour vérifier les notifications Discord',
    description: 'Ce projet sert à tester que les notifications Discord fonctionnent correctement avec toutes les données.',
    status: 'PLANNING',
    difficulty: 'INTERMEDIATE',
    maxMembers: 5,
    isPublic: true,
    githubUrl: 'https://github.com/test/project',
    liveUrl: 'https://test-project.vercel.app',
    createdAt: new Date().toISOString(),
    creator: {
      id: 'user-123',
      username: 'TestDeveloper',
      firstName: 'John',
      lastName: 'Doe',
      image: null
    },
    technologies: [
      { id: '1', name: 'React', category: 'Frontend', color: '#61DAFB', icon: '⚛️' },
      { id: '2', name: 'Node.js', category: 'Backend', color: '#339933', icon: '🟢' },
      { id: '3', name: 'PostgreSQL', category: 'Database', color: '#336791', icon: '🐘' },
      { id: '4', name: 'Tailwind CSS', category: 'Styling', color: '#06B6D4', icon: '🎨' }
    ],
    members: [
      {
        id: 'user-123',
        username: 'TestDeveloper',
        firstName: 'John',
        lastName: 'Doe',
        role: 'OWNER',
        joinedAt: new Date().toISOString()
      }
    ],
    currentMembers: 1
  };

  try {
    console.log('📡 Envoi vers:', process.env.CRAFTY_ANNOUNCE_URL || 'http://localhost:3001/announce-project');
    console.log('🔑 Secret utilisé:', process.env.CRAFTY_ANNOUNCE_SECRET ? 'Configuré ✅' : 'Manquant ❌');
    
    const response = await fetch(process.env.CRAFTY_ANNOUNCE_URL || 'http://localhost:3001/announce-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRAFTY_ANNOUNCE_SECRET || process.env.PROJECT_SECRET}`
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status de la réponse:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Succès!', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', response.status, errorText);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('1. Vérifiez que votre bot Discord est démarré (node index.js)');
      console.log('2. Vérifiez que le port 3001 est libre');
      console.log('3. Vérifiez votre URL dans CRAFTY_ANNOUNCE_URL');
    }
  }
}

// Fonction pour tester si le serveur répond
async function testServerHealth() {
  try {
    console.log('🔍 Test de santé du serveur...');
    const response = await fetch('http://localhost:3001/test');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Serveur actif:', data);
      return true;
    } else {
      console.log('❌ Serveur répond mais avec erreur:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
    return false;
  }
}

// Exécution du test
async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 TESTS DE NOTIFICATION DISCORD');
  console.log('='.repeat(50));
  
  // Test 1: Santé du serveur
  const serverOk = await testServerHealth();
  
  if (!serverOk) {
    console.log('\n❌ Le serveur Discord n\'est pas accessible.');
    console.log('💡 Démarrez votre bot avec: node index.js');
    return;
  }
  
  console.log('\n' + '-'.repeat(30));
  
  // Test 2: Notification complète
  await testNotification();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests terminés');
}

runTests();