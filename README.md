🏥 MediSuivi — Gestion des Patients

Application web de suivi des patients, née de 14 ans d'expérience en milieu hospitalier.

👩‍💻 À propos

Dienaba Camara — en formation Développeuse Web Full-Stack avec spécialité Data à Ada Tech School, promotion 2026.

Ancienne aide-soignante reconvertie dans le numérique, j'ai construit cet outil à partir d'un besoin réel vécu sur le terrain : mieux suivre les patients en service hospitalier, simplement et rapidement.

GitHub

💡 Pourquoi ce projet ?

Pendant 14 ans, j'ai travaillé comme aide-soignante en établissement hospitalier. Au quotidien, la gestion des patients repose encore beaucoup sur des outils papier ou des logiciels rigides, peu adaptés aux besoins réels du terrain.

En me reconvertissant dans le développement web, ce projet a été une évidence : construire avec mes propres mains un outil que j'aurais voulu avoir.

Ce n'est pas juste un exercice technique — c'est un projet ancré dans une réalité professionnelle que je connais de l'intérieur.

✨ Fonctionnalités
➕ Ajouter un patient (nom, chambre, niveau de priorité)
🔴 Système de priorités : Urgent / À surveiller / Stable
🔍 Recherche en temps réel par nom ou numéro de chambre
📊 Compteurs dynamiques par statut
📝 Notes cliniques par patient
🌡️ Constantes vitales (température, tension, pouls, saturation O2, glycémie)
🗑️ Suppression avec confirmation
⏰ Heure d'admission enregistrée automatiquement
📱 Design responsive (mobile et desktop)
🛠️ Technologies utilisées
Technologie	Rôle
HTML5	Structure de la page
CSS3	Mise en page, design responsive
JavaScript Vanilla	Logique métier, manipulation du DOM
Node.js + Express	Serveur backend et routes API
PostgreSQL	Base de données relationnelle
Docker	Conteneurisation de la base de données
🚀 Lancer le projet
bash
# Clone le repo
git clone https://github.com/dienamed-cmd/gestion-patients.git

# Installe les dépendances
npm install

# Lance la base de données
docker-compose up -d

# Lance le serveur
node backend/server.js

# Ouvre index.html avec Live Server
📁 Structure du projet
gestion-patients/
├── backend/
│   ├── server.js      ← Les routes API
│   └── db.js          ← La connexion PostgreSQL
├── index.html         ← La structure HTML
├── style.css          ← Tout le design
├── script.js          ← Toute la logique JavaScript
├── docker-compose.yml ← La base de données
├── .env               ← Les variables secrètes
└── README.md          ← Ce fichier
🗄️ Base de données
sql
CREATE TABLE soignant (
  id    SERIAL PRIMARY KEY,
  nom   VARCHAR(100) NOT NULL,
  role  VARCHAR(50) NOT NULL
);

CREATE TABLE patient (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  chambre     VARCHAR(10),
  priorite    VARCHAR(20) NOT NULL,
  heure       VARCHAR(10),
  notes       TEXT,
  soignant_id INT REFERENCES soignant(id)
);

CREATE TABLE constante (
  id         SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patient(id),
  type_soin  VARCHAR(50) NOT NULL,
  valeur     VARCHAR(20) NOT NULL,
  date       TIMESTAMP DEFAULT NOW()
);
🔭 Prochaines évolutions
 Inventaire des effets personnels à l'admission
 Transmissions par équipe (matin / après-midi / nuit)
 Dossier médical complet (antécédents, allergies)
 Authentification par rôle
 Export PDF des transmissions
📋 USER STORIES

Format : En tant que [qui] je veux [quoi] afin de [pourquoi]

US-01 — Ajouter un patient

En tant qu' aide-soignante, je veux ajouter un nouveau patient avec son nom, sa chambre et sa priorité, afin de l'avoir dans ma liste de suivi dès son arrivée dans le service.

Critères d'acceptance :

Je peux saisir le nom, le numéro de chambre et choisir la priorité
Si je laisse le nom vide → un message d'erreur s'affiche
Si le patient existe déjà → un message m'avertit du doublon
Après ajout → les champs se vident automatiquement
Le patient apparaît immédiatement dans la liste
US-02 — Voir la liste des patients

En tant qu' aide-soignante, je veux voir tous mes patients en un coup d'œil, afin de savoir rapidement qui est urgent et qui est stable.

Critères d'acceptance :

Les patients urgents apparaissent en premier
Chaque patient a une barre colorée (rouge / orange / vert)
Je vois le nom, la chambre, la priorité et l'heure d'admission
Les compteurs en haut se mettent à jour automatiquement
US-03 — Rechercher un patient

En tant qu' aide-soignante, je veux rechercher un patient par son nom ou son numéro de chambre, afin de le retrouver rapidement sans parcourir toute la liste.

Critères d'acceptance :

La recherche fonctionne en temps réel
Je peux chercher par nom ou par chambre
Si aucun résultat → un message s'affiche
US-04 — Filtrer par priorité

En tant qu' aide-soignante, je veux filtrer la liste par niveau de priorité, afin de me concentrer uniquement sur les patients urgents si besoin.

Critères d'acceptance :

Je peux cliquer sur "Urgents", "À surveiller" ou "Stables"
La liste se met à jour immédiatement
Le bloc sélectionné est mis en surbrillance
US-05 — Écrire des notes sur un patient

En tant qu' aide-soignante, je veux écrire des notes cliniques sur un patient, afin de garder une trace de mes observations et des soins effectués.

Critères d'acceptance :

Je clique sur "Note" → une fenêtre s'ouvre
Je peux écrire mes observations librement
Je sauvegarde → les notes sont enregistrées en base de données
US-06 — Enregistrer les constantes vitales

En tant qu' aide-soignante, je veux enregistrer la température, la tension, le pouls d'un patient, afin de garder un historique de ses constantes vitales.

Critères d'acceptance :

Je clique sur "Constantes" → une fenêtre s'ouvre
Je choisis le type (température, tension, pouls, saturation O2, glycémie)
Je tape la valeur et je clique "Ajouter"
L'historique s'affiche avec la date et l'heure
US-07 — Supprimer un patient

En tant qu' aide-soignante, je veux retirer un patient de la liste, afin de garder une liste à jour quand il quitte le service.

Critères d'acceptance :

Je clique sur "Retirer" → une confirmation s'affiche
Si je confirme → le patient disparaît de la liste
Un message de confirmation apparaît brièvement
📐 ADR — Architecture Decision Records

Les ADR documentent les décisions techniques importantes prises pendant le projet.

ADR-01 — Utiliser du JavaScript Vanilla

Date : Août 2026 | Statut : ✅ Accepté

Contexte : Je suis en formation web depuis janvier 2026 et j'apprends les bases du JavaScript.

Décision : Utiliser du JavaScript Vanilla (sans framework comme React ou Vue).

Pourquoi :

Je maîtrise les bases du JS natif appris à Ada Tech School
Permet de bien comprendre ce qui se passe dans le navigateur
Suffisant pour les fonctionnalités dont j'ai besoin
ADR-02 — Utiliser Node.js + Express pour le backend

Date : Août 2026 | Statut : ✅ Accepté

Décision : Créer un serveur Node.js avec Express et 6 routes API.

Pourquoi :

Même langage que le frontend (JavaScript)
Appris à Ada Tech School
Léger et facile à mettre en place
ADR-03 — Utiliser PostgreSQL avec Docker

Date : Août 2026 | Statut : ✅ Accepté

Décision : Base de données PostgreSQL lancée avec Docker.

Pourquoi :

Pas besoin d'installer PostgreSQL directement sur l'ordi
Même approche que sur le projet Les Globetrotteuses
Facile à partager et reproduire
ADR-04 — Séparer le code en 3 fichiers

Date : Août 2026 | Statut : ✅ Accepté

Décision : Séparer en index.html, style.css, script.js.

Pourquoi :

Bonne pratique en développement web
Chaque fichier a un rôle clair
Plus facile à lire et maintenir
ADR-05 — Design inspiré du triage hospitalier

Date : Août 2026 | Statut : ✅ Accepté

Décision : Code couleur rouge / orange / vert inspiré des bracelets de triage aux urgences.

Pourquoi :

Universellement connu dans le milieu médical
Rend l'application immédiatement lisible pour un soignant
Ma signature — ça montre que je connais le terrain
