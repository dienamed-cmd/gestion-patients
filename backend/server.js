// Je charge mes variables secrètes
require("dotenv").config();

// J'importe mes outils
const express = require("express");
const cors    = require("cors");
const pool    = require("./db");

// Je crée mon serveur
const app  = express();
const PORT = process.env.PORT || 3000;

// Je dis à mon serveur d'accepter le JSON
// et les requêtes venant de mon frontend
app.use(cors());
app.use(express.json());


// ──────────────────────────────────────
// ROUTE 1 — Récupérer tous les patients
// GET /patients
// ──────────────────────────────────────
app.get("/patients", async (req, res) => {
  try {
    // Je demande tous les patients à la base de données
    // triés par priorité (urgent en premier)
    let resultat = await pool.query(`
      SELECT * FROM patient
      ORDER BY
        CASE priorite
          WHEN 'urgent'     THEN 1
          WHEN 'surveiller' THEN 2
          WHEN 'stable'     THEN 3
        END
    `);

    // J'envoie la liste au frontend
    res.json(resultat.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});


// ──────────────────────────────────────
// ROUTE 2 — Ajouter un patient
// POST /patients
// ──────────────────────────────────────
app.post("/patients", async (req, res) => {
  try {
    // Je récupère les infos envoyées par le frontend
    let { nom, chambre, priorite, notes, heure } = req.body;

    // Je les enregistre dans la base de données
    let resultat = await pool.query(
      `INSERT INTO patient (nom, chambre, priorite, notes, heure)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nom, chambre, priorite, notes, heure]
    );

    // J'envoie le nouveau patient créé au frontend
    res.status(201).json(resultat.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});


// ──────────────────────────────────────
// ROUTE 3 — Supprimer un patient
// DELETE /patients/:id
// ──────────────────────────────────────
app.delete("/patients/:id", async (req, res) => {
  try {
    // Je récupère l'id du patient à supprimer
    let id = req.params.id;

    // Je le supprime de la base de données
    await pool.query("DELETE FROM patient WHERE id = $1", [id]);

    // Je confirme la suppression
    res.json({ message: "Patient supprimé" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});


// ──────────────────────────────────────
// ROUTE 4 — Mettre à jour les notes
// PUT /patients/:id
// ──────────────────────────────────────
app.put("/patients/:id", async (req, res) => {
  try {
    let id    = req.params.id;
    let { notes } = req.body;

    let resultat = await pool.query(
      `UPDATE patient SET notes = $1 WHERE id = $2 RETURNING *`,
      [notes, id]
    );

    res.json(resultat.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});

// ──────────────────────────────────────
// ROUTE 5 — Ajouter une constante vitale
// POST /constantes
// ──────────────────────────────────────
app.post("/constantes", async (req, res) => {
  try {
    // Je récupère les infos envoyées depuis le formulaire
    let { patient_id, type_soin, valeur } = req.body;

    // Je les enregistre dans la table constante
    let resultat = await pool.query(
      `INSERT INTO constante (patient_id, type_soin, valeur)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [patient_id, type_soin, valeur]
    );

    res.status(201).json(resultat.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});


// ──────────────────────────────────────
// ROUTE 6 — Récupérer les constantes d'un patient
// GET /constantes/:patient_id
// ──────────────────────────────────────
app.get("/constantes/:patient_id", async (req, res) => {
  try {
    let patient_id = req.params.patient_id;

    // Je récupère toutes les constantes de ce patient
    // Les plus récentes en premier
    let resultat = await pool.query(
      `SELECT * FROM constante
       WHERE patient_id = $1
       ORDER BY date DESC`,
      [patient_id]
    );

    res.json(resultat.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: "Erreur serveur" });
  }
});

// ──────────────────────────────────────
// Je lance mon serveur
// ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});