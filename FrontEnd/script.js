console.log("Le script fonctionne !");

//////////////////////////////////////////////////////
// 🔹 PARTIE 1 — AFFICHAGE DE LA GALERIE PRINCIPALE //
//////////////////////////////////////////////////////

// Sélectionne l'élément qui contient la galerie d’images
const gallery = document.querySelector(".gallery");

// Sélectionne le menu de filtres par catégories (doit exister dans le HTML)
const categoryMenu = document.querySelector(".category-menu");

// 🔁 Récupère tous les projets pour les afficher et créer les filtres
fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    console.log("Données récupérées :", data);
    displayGallery(data); // Affiche tous les travaux dans la galerie

    // 🔁 Crée dynamiquement les filtres (boutons par catégorie)
    const categories = [...new Set(data.map(work => work.category.name))];
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tous";
    allBtn.classList.add("active");
    categoryMenu.appendChild(allBtn);

    categories.forEach(category => {
      const btn = document.createElement("button");
      btn.textContent = category;
      categoryMenu.appendChild(btn);
    });

    // 🔁 Filtrage quand on clique sur un bouton
    categoryMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        // Gère le style actif
        document.querySelectorAll(".category-menu button").forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        const selected = e.target.textContent;
        if (selected === "Tous") {
          displayGallery(data);
        } else {
          const filtered = data.filter(work => work.category.name === selected);
          displayGallery(filtered);
        }
      }
    });
  })
  .catch(error => {
    console.error("Erreur lors du fetch :", error);
  });

// ✅ Fonction pour afficher des travaux dans la galerie principale
function displayGallery(works) {
  gallery.innerHTML = "";
  works.forEach(work => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

//////////////////////////////////////////////////////
// 🔹 PARTIE 2 — GESTION DE LA CONNEXION UTILISATEUR //
//////////////////////////////////////////////////////

const token = localStorage.getItem("token");

if (token) {
  // Affiche la barre d’édition
  const editionBar = document.querySelector(".edition-bar");
  if (editionBar) editionBar.style.display = "block";

  // Affiche tous les boutons "Modifier"
  document.querySelectorAll(".edit-button").forEach(btn => {
    btn.style.display = "inline-block";
  });

  // Change "login" en "logout"
  const loginLink = document.getElementById("login-link");
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload(); // Déconnecte l'utilisateur
    });
  }
}

//////////////////////////////////////////
// 🔹 PARTIE 3 — MODALE : OUVERTURE/FERMETURE //
//////////////////////////////////////////

const modal = document.getElementById("modal");
const openModalBtn = document.querySelector(".edit-button");
const closeModalBtn = document.querySelector(".modal-close");

// ✅ Ouvre la modale et charge les miniatures
openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";

  fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(data => {
      afficherGalerieModale(data); // Affiche les miniatures dans la modale
    });
});

// ✅ Ferme la modale si on clique sur la croix
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// ✅ Ferme la modale si on clique en dehors du contenu
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

//////////////////////////////////////////////////////////
// 🔹 PARTIE 4 — MODALE : AFFICHAGE MINIATURES + SUPPRESSION //
//////////////////////////////////////////////////////////

// 🔁 Affiche les projets dans la modale (miniatures + poubelle)
function afficherGalerieModale(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = ""; // Vide l’ancienne galerie

  works.forEach(work => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    // 🗑️ Bouton de suppression
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;

    // 🔁 Clique sur la poubelle
    deleteBtn.addEventListener("click", () => {
      supprimerTravail(work.id, figure); // Envoie à la fonction de suppression
    });

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
}


// ❌ Supprime un projet dans l’API et dans le DOM
function supprimerTravail(id, element) {
  const token = localStorage.getItem("token"); // récupère le token

  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.ok) {
        element.remove(); // ✅ Supprime le projet dans la modale sans recharger
        console.log(`Projet ${id} supprimé avec succès.`);
      } else {
        console.error("Erreur serveur :", response.status);
        alert("La suppression du projet a échoué.");
      }
    })
    .catch(error => {
      console.error("Erreur réseau :", error);
      alert("Une erreur est survenue lors de la suppression.");
    });
}

// ==========================
//  Étape 3.3 - Ajout projet
// ==========================

// Récupération des éléments HTML importants
const modalViewGallery = document.querySelector(".modal-view-gallery"); // Vue avec miniatures
const modalViewAdd = document.querySelector(".modal-view-add"); // Vue avec formulaire
const addPhotoBtn = document.querySelector(".modal-add-button"); // Bouton "Ajouter une photo"
const backBtn = document.querySelector(".modal-back-button"); // Bouton "Retour"
const addForm = document.getElementById("add-form"); // Formulaire d'ajout

// --------------------------
// 1️⃣ Changement de vue
// --------------------------

// Quand on clique sur "Ajouter une photo"
addPhotoBtn.addEventListener("click", () => {
  modalViewGallery.style.display = "none"; // Cache la galerie
  modalViewAdd.style.display = "block"; // Affiche le formulaire
});

// Quand on clique sur "← Retour"
backBtn.addEventListener("click", () => {
  modalViewAdd.style.display = "none"; // Cache le formulaire
  modalViewGallery.style.display = "block"; // Affiche la galerie
});

// --------------------------
// 2️⃣ Fonction utilitaire pour ajouter un projet dans la galerie principale
// --------------------------
function ajouterProjetDansGalerie(work) {
  const gallery = document.querySelector(".gallery");

  const figure = document.createElement("figure");
  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  const caption = document.createElement("figcaption");
  caption.textContent = work.title;

  figure.appendChild(img);
  figure.appendChild(caption);
  gallery.appendChild(figure);
}

// Fonction pour créer un projet dans la galerie modale
function ajouterProjetDansModale(work) {
  const modalGallery = document.querySelector(".modal-gallery");

  const figure = document.createElement("figure");
  figure.classList.add("modal-figure");

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  // Bouton poubelle
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteBtn.setAttribute("data-id", work.id);

  deleteBtn.addEventListener("click", () => {
    supprimerTravail(work.id, figure);
  });

  figure.appendChild(img);
  figure.appendChild(deleteBtn);
  modalGallery.appendChild(figure);
}

// 3️⃣ Envoi du formulaire

addForm.addEventListener("submit", (e) => {
  e.preventDefault(); // 🚫 Empêche le rechargement de la page

  const token = localStorage.getItem("token"); // 🔑 Récupère le token
  if (!token) {
    alert("Vous devez être connecté pour ajouter un projet.");
    return;
  }

  // 📦 On prépare les données à envoyer
  const formData = new FormData();
  formData.append("image", document.getElementById("image").files[0]);
  formData.append("title", document.getElementById("title").value);
  formData.append("category", document.getElementById("category").value);

  // 🛑 Vérifie que tous les champs sont remplis
  if (!formData.get("image") || !formData.get("title") || !formData.get("category")) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  // 🚀 Envoi au backend
  fetch("http://localhost:5678/api/works", {
    method: "POST",
    body: formData,
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      console.log("Statut HTTP :", response.status);

      // ✅ Si le backend répond 200 ou 201 → succès
      if (response.status === 200 || response.status === 201) {
        // ⚠️ Si le backend ne renvoie pas de JSON, on évite l'erreur
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json(); // On retourne les données du nouveau projet
        } else {
          return {}; // Pas de JSON mais succès quand même
        }
      } else {
        throw new Error("Erreur serveur : " + response.status);
      }
    })
    .then(newWork => {
      console.log("Nouveau projet :", newWork);

      // 📌 Ajout direct dans la galerie principale
      ajouterProjetDansGalerie(newWork);

      // 📌 Recharge la galerie modale (tu peux la faire avec fetch si besoin)
      fetch("http://localhost:5678/api/works")
        .then(res => res.json())
        .then(data => afficherGalerieModale(data));

      // ♻️ Réinitialise le formulaire
      addForm.reset();

      // ↩️ Retour à la vue "Galerie photo"
      modalViewAdd.style.display = "none";
      modalViewGallery.style.display = "block";
    })
    .catch(error => {
      console.error("Erreur :", error);
      alert("Impossible d'ajouter le projet.");
    });
});

