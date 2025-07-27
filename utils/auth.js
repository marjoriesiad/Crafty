// Middleware d'authentification pour les routes API

function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token || token !== process.env.PROJECT_SECRET) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }
  next();
}

module.exports = {
  authenticateRequest
};