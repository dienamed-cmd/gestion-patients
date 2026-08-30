// Je charge mes informations secrètes depuis le fichier .env
require("dotenv").config();

// J'importe pg pour me connecter à PostgreSQL
const { Pool } = require("pg");

// Je crée ma connexion à la base de données
// avec les infos que j'ai mises dans mon fichier .env
const pool = new Pool({
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Je teste que la connexion fonctionne
pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL !"))
  .catch((err) => console.error("❌ Erreur de connexion :", err));

// J'exporte pool pour pouvoir l'utiliser dans mes routes
module.exports = pool;