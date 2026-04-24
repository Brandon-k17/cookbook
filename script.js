let listeRecettes = [];
let categorieChoisie = "Toutes";

async function chargerDonnees() {
  try {
    const reponse = await fetch("recipes.json");
    if (!reponse.ok) throw new Error("recipes.json introuvable !");
    listeRecettes = await reponse.json();
    remplirGrille();
    construireSidebar();
  } catch (erreur) {
    document.getElementById("grille").innerHTML =
      `<p style="color:red; padding:1rem;">
         Erreur : ${erreur.message}<br>
        Lance le projet avec Live Server.
      </p>`;
  }
}

function remplirGrille() {
  for (let i = 0; i < listeRecettes.length; i++) {
    const recette = listeRecettes[i];
    const fiche = document.getElementById("fiche-" + recette.id);
    if (!fiche) continue;

    fiche.setAttribute("data-categorie", recette.categorie);
    fiche.querySelector(".fiche-image").src = recette.image;
    fiche.querySelector(".fiche-image").alt = recette.nom;
    fiche.querySelector(".fiche-categorie").textContent = " " + recette.categorie.toUpperCase();
    fiche.querySelector(".fiche-titre").textContent = recette.nom;
    fiche.querySelector(".fiche-ingredients").textContent = recette.ingredients.join(", ");

    fiche.querySelector(".bouton-detail").addEventListener("click", function() {
      afficherDetail(recette);
    });
  }
}

function construireSidebar() {
  const categories = ["Toutes", ...new Set(listeRecettes.map(r => r.categorie))];
  const liste = document.getElementById("liste-categories");
  liste.innerHTML = "";

  categories.forEach(function(cat) {
    const nb = (cat === "Toutes")
      ? listeRecettes.length
      : listeRecettes.filter(r => r.categorie === cat).length;

    const elementListe  = document.createElement("li");
    const bouton = document.createElement("button");
    bouton.className = "bouton-categorie" + (cat === categorieChoisie ? " actif" : "");
    bouton.innerHTML = `<span>${cat}</span><span class="compteur-badge">${nb}</span>`;

    bouton.addEventListener("click", function() {
      categorieChoisie = cat;
      construireSidebar();
      filtrerCartes();
    });

    elementListe.appendChild(bouton);
    liste.appendChild(elementListe);
  });
}

function filtrerCartes() {
  const texte = document.getElementById("recherche").value.toLowerCase();
  const toutesLesFiches = document.querySelectorAll(".fiche");

  toutesLesFiches.forEach(function(fiche) {
    const cat = fiche.getAttribute("data-categorie");
    const nom = fiche.querySelector(".fiche-titre").textContent.toLowerCase();

    const okCategorie = (categorieChoisie === "Toutes") || (cat === categorieChoisie);
    const okRecherche = nom.includes(texte);

    if (okCategorie && okRecherche) {
      fiche.style.display = "";
    } else {
      fiche.style.display = "none";
    }
  });

  titreSection.textContent = (categorieChoisie === "Toutes")
    ? "Toutes les recettes"
    : categorieChoisie;
}

document.getElementById("recherche").addEventListener("input", filtrerCartes);
const titreSection = document.getElementById("titre-section");

function afficherDetail(recette) {
  document.getElementById("image-detail").src = recette.image;
  document.getElementById("image-detail").alt = recette.nom;
  document.getElementById("detail-categorie").textContent  = recette.categorie.toUpperCase();
  document.getElementById("detail-nom").textContent        = recette.nom;
  document.getElementById("detail-instructions").textContent = recette.instructions;

  const listeIngredients = document.getElementById("detail-ingredients");
  listeIngredients.innerHTML = "";

  recette.ingredients.forEach(function(ingredient) {
    const elementListe = document.createElement("li");
    elementListe.textContent = ingredient;
    listeIngredients.appendChild(elementListe);
  });

  document.getElementById("fond-detail").classList.remove("masque");
}

document.getElementById("bouton-fermer-detail").addEventListener("click", function() {
  document.getElementById("fond-detail").classList.add("masque");
});

document.getElementById("fond-detail").addEventListener("click", function(e) {
  if (e.target === this) this.classList.add("masque");
});

document.getElementById("bouton-ouvrir-formulaire").addEventListener("click", function() {
  document.getElementById("fond-formulaire").classList.remove("masque");
});

function reinitialiserFormulaire() {
  document.getElementById("fond-formulaire").classList.add("masque");
  document.getElementById("champ-nom").value          = "";
  document.getElementById("champ-categorie").value    = "";
  document.getElementById("champ-ingredients").value  = "";
  document.getElementById("champ-instructions").value = "";
  document.getElementById("erreur-nom").textContent          = "";
  document.getElementById("erreur-categorie").textContent    = "";
  document.getElementById("erreur-ingredients").textContent  = "";
  document.getElementById("erreur-instructions").textContent = "";
}

document.getElementById("bouton-fermer-formulaire").addEventListener("click", reinitialiserFormulaire);
document.getElementById("bouton-annuler").addEventListener("click", reinitialiserFormulaire);
document.getElementById("fond-formulaire").addEventListener("click", function(e) {
  if (e.target === this) reinitialiserFormulaire();
});

document.getElementById("bouton-enregistrer").addEventListener("click", async function() {

  const nom          = document.getElementById("champ-nom").value.trim();
  const categorie    = document.getElementById("champ-categorie").value;
  const ingredients  = document.getElementById("champ-ingredients").value.trim();
  const instructions = document.getElementById("champ-instructions").value.trim();

  document.getElementById("erreur-nom").textContent          = "";
  document.getElementById("erreur-categorie").textContent    = "";
  document.getElementById("erreur-ingredients").textContent  = "";
  document.getElementById("erreur-instructions").textContent = "";

  let formulaireValide = true;
  if (!nom)          { document.getElementById("erreur-nom").textContent          = "Obligatoire."; formulaireValide = false; }
  if (!categorie)    { document.getElementById("erreur-categorie").textContent    = "Choisissez une catégorie."; formulaireValide = false; }
  if (!ingredients)  { document.getElementById("erreur-ingredients").textContent  = "Obligatoire."; formulaireValide = false; }
  if (!instructions) { document.getElementById("erreur-instructions").textContent = "Obligatoire."; formulaireValide = false; }
  if (!formulaireValide) return;

  const boutonEnregistrer = document.getElementById("bouton-enregistrer");
  boutonEnregistrer.textContent = "Envoi...";
  boutonEnregistrer.disabled = true;

  try {
    await new Promise(function(resolve) { setTimeout(resolve, 1000); });

    const nouvelleRecette = {
      id:           listeRecettes.length + 1,
      nom:          nom,
      categorie:    categorie,
      image:        "images/nodemailer.jpg",
      ingredients:  ingredients.split(",").map(i => i.trim()),
      instructions: instructions
    };

    listeRecettes.push(nouvelleRecette);
    creerCarte(nouvelleRecette);

    categorieChoisie = "Toutes";
    construireSidebar();
    filtrerCartes();

    reinitialiserFormulaire();
    afficherNotification(" Recette ajoutée avec succès !");

  } catch(e) {
    afficherNotification(" Erreur lors de l'ajout.");
  } finally {
    boutonEnregistrer.textContent = "Enregistrer";
    boutonEnregistrer.disabled = false;
  }
});

function creerCarte(recette) {
  const grille  = document.getElementById("grille");
  const fiche   = document.createElement("div");
  fiche.className = "fiche";
  fiche.id = "fiche-" + recette.id;
  fiche.setAttribute("data-categorie", recette.categorie);

  fiche.innerHTML = `
    <img class="fiche-image" src="${recette.image}" alt="${recette.nom}" />
    <div class="fiche-contenu">
      <p class="fiche-categorie"> ${recette.categorie.toUpperCase()}</p>
      <h3 class="fiche-titre">${recette.nom}</h3>
      <p class="fiche-ingredients">${recette.ingredients.join(", ")}</p>
      <button class="bouton-detail">Voir le détail →</button>
    </div>
  `;

  fiche.querySelector(".bouton-detail").addEventListener("click", function() {
    afficherDetail(recette);
  });

  grille.appendChild(fiche);
}

function afficherNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("visible");
  setTimeout(function() {
    notification.classList.remove("visible");
  }, 3000);
}

chargerDonnees();