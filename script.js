// ──────────────────────────────────────
// L'adresse de mon serveur backend
// C'est là que j'envoie et je récupère mes données
// ──────────────────────────────────────
const API = "http://localhost:3000";

// Je retiens quel filtre est actif (tous, urgent, surveiller ou stable)
let filtreActif = "tous";

// Je retiens quel patient je suis en train de modifier dans la fenêtre notes
let indexModal  = null;

// Je stocke mes patients récupérés depuis la base de données
let patients = [];


// ──────────────────────────────────────
// J'affiche la date du jour en haut de ma page
// ──────────────────────────────────────
const afficherDate = () => {
  let options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  document.getElementById("dateAffichee").textContent =
    new Date().toLocaleDateString("fr-FR", options);
};


// ──────────────────────────────────────
// J'affiche un petit message de confirmation en bas à droite
// Il disparaît tout seul après 2,5 secondes
// ──────────────────────────────────────
const afficherToast = (message) => {
  document.getElementById("toastMessage").textContent = message;
  let toast = document.getElementById("toast");
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2500);
};


// ──────────────────────────────────────
// J'ouvre ou je ferme le formulaire d'ajout
// ──────────────────────────────────────
const toggleFormulaire = () => {
  let panneau = document.getElementById("formulairePanneau");
  if (panneau.style.display === "none" || panneau.style.display === "") {
    panneau.style.display = "block";
    document.getElementById("inputNom").focus();
  } else {
    panneau.style.display = "none";
  }
};


// ──────────────────────────────────────
// Je change le filtre quand je clique sur un bloc de triage
// ──────────────────────────────────────
const setFiltre = (valeur, element) => {
  filtreActif = valeur;
  let segments = document.querySelectorAll(".triage-segment");
  for (let i = 0; i < segments.length; i++) {
    segments[i].classList.remove("actif");
  }
  element.classList.add("actif");
  afficher();
};


// ──────────────────────────────────────
// Je récupère tous les patients depuis la base de données
// J'utilise fetch() pour appeler mon backend
// ──────────────────────────────────────
const chargerPatients = async () => {
  try {
    // J'appelle la route GET /patients de mon serveur
    let reponse = await fetch(API + "/patients");

    // Je transforme la réponse en tableau JavaScript
    patients = await reponse.json();

    // Je mets à jour l'affichage
    afficher();

  } catch (err) {
    console.error("Erreur lors du chargement :", err);
    afficherToast("Impossible de contacter le serveur");
  }
};


// ──────────────────────────────────────
// J'ajoute un nouveau patient
// J'envoie les données à mon backend avec fetch()
// ──────────────────────────────────────
async function ajouter() {

  let nom     = document.getElementById("inputNom").value.trim();
  let chambre = document.getElementById("inputChambre").value.trim();
  let statut  = document.getElementById("statut").value;

  // Si j'ai oublié le nom → message d'erreur
  if (nom === "") {
    document.getElementById("erreur").textContent = "Le nom du patient est obligatoire.";
    document.getElementById("erreur").style.display = "block";
    return;
  }

  // Je vérifie les doublons dans mon tableau local
  let doublon = false;
  for (let i = 0; i < patients.length; i++) {
    if (patients[i].nom.toLowerCase() === nom.toLowerCase()) {
      doublon = true;
    }
  }

  if (doublon === true) {
    document.getElementById("erreur").textContent = "Ce patient est déjà enregistré.";
    document.getElementById("erreur").style.display = "block";
    return;
  }

  // Je prépare la fiche du patient à envoyer au serveur
  let nouveauPatient = {
    nom:      nom,
    chambre:  chambre || "—",
    priorite: statut,
    notes:    "",
    heure:    new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit"
    })
  };

  try {
    // J'envoie la fiche à mon serveur avec POST
    let reponse = await fetch(API + "/patients", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(nouveauPatient)
    });

    let patientCree = await reponse.json();

    // Je vide le formulaire
    document.getElementById("inputNom").value       = "";
    document.getElementById("inputChambre").value   = "";
    document.getElementById("statut").value         = "stable";
    document.getElementById("erreur").style.display = "none";

    // Je recharge la liste depuis la base de données
    await chargerPatients();
    afficherToast("✅ " + patientCree.nom + " ajouté(e)");

  } catch (err) {
    console.error("Erreur lors de l'ajout :", err);
    afficherToast("Impossible d'ajouter le patient");
  }
}


// ──────────────────────────────────────
// J'affiche la liste des patients sur l'écran
// ──────────────────────────────────────
function afficher() {

  let liste     = document.getElementById("liste");
  let vide      = document.getElementById("vide");
  let recherche = document.getElementById("recherche").value.toLowerCase();
  let tri       = document.getElementById("triSelect").value;

  liste.innerHTML = "";

  // Je compte les patients par statut pour les compteurs
  let nbUrgent     = 0;
  let nbSurveiller = 0;
  let nbStable     = 0;

  for (let i = 0; i < patients.length; i++) {
    if (patients[i].priorite === "urgent") {
      nbUrgent = nbUrgent + 1;
    } else if (patients[i].priorite === "surveiller") {
      nbSurveiller = nbSurveiller + 1;
    } else {
      nbStable = nbStable + 1;
    }
  }

  document.getElementById("nbTous").textContent       = patients.length;
  document.getElementById("nbUrgent").textContent     = nbUrgent;
  document.getElementById("nbSurveiller").textContent = nbSurveiller;
  document.getElementById("nbStable").textContent     = nbStable;

  // Je filtre selon la recherche et le filtre actif
  let patientsFiltres = [];

  for (let i = 0; i < patients.length; i++) {
    let patient = patients[i];

    let correspondRecherche =
      patient.nom.toLowerCase().includes(recherche) ||
      (patient.chambre && patient.chambre.toLowerCase().includes(recherche));

    let correspondFiltre =
      filtreActif === "tous" || patient.priorite === filtreActif;

    if (correspondRecherche && correspondFiltre) {
      patientsFiltres.push(patient);
    }
  }

  // Je trie ma liste
  let ordreStatut = { "urgent": 0, "surveiller": 1, "stable": 2 };

  if (tri === "priorite") {
    patientsFiltres.sort((a, b) => ordreStatut[a.priorite] - ordreStatut[b.priorite]);
  } else if (tri === "nom") {
    patientsFiltres.sort((a, b) => a.nom.localeCompare(b.nom));
  } else {
    patientsFiltres.sort((a, b) => (b.heure || "").localeCompare(a.heure || ""));
  }

  // Si liste vide → message
  if (patientsFiltres.length === 0) {
    vide.style.display  = "block";
    liste.style.display = "none";

    if (recherche !== "" || filtreActif !== "tous") {
      document.querySelector(".vide-titre").textContent = "Aucun résultat";
      document.querySelector(".vide-sous").textContent  = "Modifiez votre recherche ou filtre.";
    } else {
      document.querySelector(".vide-titre").textContent = "Aucun patient enregistré";
      document.querySelector(".vide-sous").textContent  = "Cliquez sur Nouveau patient pour commencer.";
    }
    return;
  }

  vide.style.display  = "none";
  liste.style.display = "flex";

  for (let i = 0; i < patientsFiltres.length; i++) {

    let patient = patientsFiltres[i];

    // Texte du badge selon la priorité
    let texteBadge = "";
    if (patient.priorite === "urgent") {
      texteBadge = "Urgent";
    } else if (patient.priorite === "surveiller") {
      texteBadge = "A surveiller";
    } else {
      texteBadge = "Stable";
    }

    // Aperçu des notes
    let apercuNotes = patient.notes ? patient.notes : "Aucune note";

    // Initiale de l'avatar
    let initiale = patient.nom.charAt(0).toUpperCase();

    let carte = document.createElement("li");
    carte.className = "patient-carte";

    carte.innerHTML =
      '<div class="carte-barre ' + patient.priorite + '"></div>' +
      '<div class="carte-corps">' +
        '<div class="carte-avatar ' + patient.priorite + '">' + initiale + '</div>' +
        '<span class="carte-nom">' + patient.nom + '</span>' +
        '<span class="carte-chambre">Ch. ' + (patient.chambre || "—") + '</span>' +
        '<span class="badge ' + patient.priorite + '">' + texteBadge + '</span>' +
        '<span class="carte-notes">' + apercuNotes + '</span>' +
        '<span class="carte-heure">' + (patient.heure || "—") + '</span>' +
      '</div>' +
      
            '<div class="carte-actions">' +
        '<button class="btn-petit btn-constante" onclick="ouvrirConstantes(' + patient.id + ', \'' + patient.nom + '\')">Constantes</button>' +
        '<button class="btn-petit btn-note" onclick="ouvrirModal(' + patient.id + ')">Note</button>' +
        '<button class="btn-petit btn-retirer" onclick="supprimer(' + patient.id + ', \'' + patient.nom + '\')">Retirer</button>' +
      '</div>';
    liste.appendChild(carte);
  }
}


// ──────────────────────────────────────
// Je supprime un patient
// J'envoie une requête DELETE à mon serveur
// ──────────────────────────────────────
async function supprimer(id, nom) {

  let reponse = confirm("Retirer " + nom + " de la liste ?");

  if (reponse === true) {
    try {
      // J'appelle la route DELETE /patients/:id
      await fetch(API + "/patients/" + id, {
        method: "DELETE"
      });

      await chargerPatients();
      afficherToast("🗑️ " + nom + " retiré(e)");

    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      afficherToast("Impossible de supprimer le patient");
    }
  }
}


// ──────────────────────────────────────
// J'ouvre la fenêtre des notes
// ──────────────────────────────────────
function ouvrirModal(id) {
  let patient = null;

  // Je retrouve le patient par son id
  for (let i = 0; i < patients.length; i++) {
    if (patients[i].id === id) {
      patient = patients[i];
    }
  }

  if (patient === null) return;

  indexModal = id;

  document.getElementById("modalTitre").textContent = patient.nom;
  document.getElementById("modalSous").textContent  = "Chambre " + (patient.chambre || "—");
  document.getElementById("modalNotes").value       = patient.notes || "";

  document.getElementById("modalFond").classList.add("ouvert");
}


// ──────────────────────────────────────
// Je ferme la fenêtre des notes
// ──────────────────────────────────────
const fermerModal = () => {
  document.getElementById("modalFond").classList.remove("ouvert");
  indexModal = null;
};


// ──────────────────────────────────────
// Je sauvegarde les notes
// J'envoie une requête PUT à mon serveur
// ──────────────────────────────────────
async function sauverNotes() {

  if (indexModal === null) return;

  let notes = document.getElementById("modalNotes").value.trim();

  try {
    // J'appelle la route PUT /patients/:id
    await fetch(API + "/patients/" + indexModal, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ notes: notes })
    });

    await chargerPatients();
    fermerModal();
    afficherToast("Notes sauvegardées");

  } catch (err) {
    console.error("Erreur lors de la sauvegarde :", err);
    afficherToast("Impossible de sauvegarder les notes");
  }
}


// ──────────────────────────────────────
// Si je clique en dehors de la fenêtre → elle se ferme
// ──────────────────────────────────────
document.getElementById("modalFond").addEventListener("click", (evenement) => {
  if (evenement.target === document.getElementById("modalFond")) {
    fermerModal();
  }
});


// ──────────────────────────────────────
// Quand la page se charge
// Je récupère les patients depuis la base de données
// ──────────────────────────────────────

// ──────────────────────────────────────
// J'ouvre la fenêtre des constantes vitales
// ──────────────────────────────────────
async function ouvrirConstantes(id, nom) {
  let reponse = await fetch(API + "/constantes/" + id);
  let constantes = await reponse.json();

  let historique = "";
  if (constantes.length === 0) {
    historique = "<p style='color:#9B9B8E;font-style:italic'>Aucune constante enregistrée.</p>";
  } else {
    for (let i = 0; i < constantes.length; i++) {
      let c = constantes[i];
      let date = new Date(c.date).toLocaleString("fr-FR");
      historique += "<div style='padding:8px 0;border-bottom:1px solid #E2E2DC'>" +
        "<strong>" + c.type_soin + "</strong> : " + c.valeur +
        "<span style='color:#9B9B8E;font-size:0.75rem;margin-left:10px'>" + date + "</span>" +
        "</div>";
    }
  }

  document.getElementById("modalFond").innerHTML = `
    <div class="modal">
      <div class="modal-entete">
        <div>
          <div class="modal-titre">Constantes — ${nom}</div>
          <div class="modal-sous">Ajouter une mesure</div>
        </div>
        <button class="btn-fermer" onclick="fermerConstantes()">✕</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <select id="typeConstante" style="flex:1;padding:8px;border:1px solid #E2E2DC;border-radius:8px;font-family:inherit">
          <option value="Température">🌡️ Température (°C)</option>
          <option value="Tension">💉 Tension (mmHg)</option>
          <option value="Pouls">❤️ Pouls (bpm)</option>
          <option value="Saturation O2">🫁 Saturation O2 (%)</option>
          <option value="Glycémie">🩸 Glycémie (g/L)</option>
        </select>
        <input id="valeurConstante" type="text" placeholder="Ex: 37.5" style="flex:1;padding:8px;border:1px solid #E2E2DC;border-radius:8px;font-family:inherit" />
        <button onclick="ajouterConstante(${id})" class="btn-sauver">Ajouter</button>
      </div>
      <div id="historiqueConstantes">${historique}</div>
      <div class="modal-pied">
        <button class="btn-annuler" onclick="fermerConstantes()">Fermer</button>
      </div>
    </div>`;

  document.getElementById("modalFond").classList.add("ouvert");
}


// ──────────────────────────────────────
// J'ajoute une constante vitale
// ──────────────────────────────────────
async function ajouterConstante(patientId) {
  let type   = document.getElementById("typeConstante").value;
  let valeur = document.getElementById("valeurConstante").value.trim();

  if (valeur === "") {
    alert("Entre une valeur !");
    return;
  }

  try {
    await fetch(API + "/constantes", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ patient_id: patientId, type_soin: type, valeur: valeur })
    });

    let reponse    = await fetch(API + "/constantes/" + patientId);
    let constantes = await reponse.json();

    let historique = "";
    for (let i = 0; i < constantes.length; i++) {
      let c    = constantes[i];
      let date = new Date(c.date).toLocaleString("fr-FR");
      historique += "<div style='padding:8px 0;border-bottom:1px solid #E2E2DC'>" +
        "<strong>" + c.type_soin + "</strong> : " + c.valeur +
        "<span style='color:#9B9B8E;font-size:0.75rem;margin-left:10px'>" + date + "</span>" +
        "</div>";
    }

    document.getElementById("historiqueConstantes").innerHTML = historique;
    document.getElementById("valeurConstante").value = "";
    afficherToast("✅ Constante enregistrée !");

  } catch (err) {
    console.error(err);
    afficherToast("Impossible d'enregistrer la constante");
  }
}


// ──────────────────────────────────────
// Je ferme la fenêtre des constantes
// ──────────────────────────────────────
function fermerConstantes() {
  document.getElementById("modalFond").classList.remove("ouvert");
  location.reload();
}
afficherDate();
chargerPatients();