console.log("Le script fonctionne !");

// 1. Sélectionne la galerie dans le HTML
const gallery = document.querySelector(".gallery");

// 2. Sélectionne aussi le menu des catégories (tu dois avoir <div class="category-menu"></div> dans le HTML)
const categoryMenu = document.querySelector(".category-menu");

fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    console.log("Données récupérées :", data);

    // --- Partie 1 : Affiche tous les travaux ---
    displayGallery(data);

    // --- Partie 2 : Gère les catégories dynamiquement ---
    // Récupère les catégories uniques
    const categories = [...new Set(data.map(work => work.category.name))];

    // Crée le bouton "Tous"
    const allBtn = document.createElement("button");
    allBtn.textContent = "Tous";
    allBtn.classList.add("active");
    categoryMenu.appendChild(allBtn);

    // Crée un bouton pour chaque catégorie
    categories.forEach(category => {
      const btn = document.createElement("button");
      btn.textContent = category;
      categoryMenu.appendChild(btn);
    });

    // Écoute les clics sur les boutons
    categoryMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        // Active visuellement le bouton cliqué
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

// Fonction qui affiche des projets dans la galerie
function displayGallery(works) {
  gallery.innerHTML = ""; // vide la galerie
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



const token = localStorage.getItem("token");

if (token) {
  // Affiche la barre d'édition
  const editionBar = document.querySelector(".edition-bar");
  if (editionBar) {
    editionBar.style.display = "block";
  }

  // Affiche les boutons "modifier"
  const editButtons = document.querySelectorAll(".edit-button");
  editButtons.forEach(btn => {
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
      window.location.reload(); // recharge la page sans le token
    });
  }
}

// Modale
const modal = document.getElementById("modal");
const openModalBtn = document.querySelector(".edit-button");
const closeModalBtn = document.querySelector(".modal-close");

openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fermer la modale au clic en dehors du contenu
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Supprime
function afficherGalerieModale(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = ""; // 🔁 Nettoie l'ancienne galerie

  works.forEach(work => {
    // 🔹 Création de l'encart projet
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    // 🔹 Image du projet
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    // ✅ Bouton de suppression
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    deleteBtn.setAttribute("data-id", work.id);

    // 🔁 Clique sur la poubelle = on supprime le projet
    deleteBtn.addEventListener("click", () => {
      supprimerTravail(work.id, figure);
    });

    // 🔧 Ajout des éléments dans le DOM
    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}


function supprimerTravail(id, element) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.ok) {
        // ✅ Suppression dans le DOM
        element.remove();
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

