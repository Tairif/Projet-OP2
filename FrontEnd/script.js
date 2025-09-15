console.log("Le script fonctionne !");

// ========================================================
// 🔹 PARTIE 1 — AFFICHAGE DE LA GALERIE PRINCIPALE
// ========================================================

const gallery = document.querySelector(".gallery");
const categoryMenu = document.querySelector(".category-menu");

fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(data => {
    displayGallery(data);

    // ✅ On affiche les filtres seulement si pas connecté
    if (!localStorage.getItem("token")) {
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

      // Filtrage
      categoryMenu.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") {
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
    }
  })
  .catch(error => console.error("Erreur lors du fetch :", error));


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

// ========================================================
// 🔹 PARTIE 2 — GESTION DE LA CONNEXION UTILISATEUR
// ========================================================

const token = localStorage.getItem("token");

if (token) {
  const editionBar = document.querySelector(".edition-bar");
  if (editionBar) editionBar.style.display = "block";

  document.querySelectorAll(".edit-button").forEach(btn => {
    btn.style.display = "inline-block";
  });

  const loginLink = document.getElementById("login-link");
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload();
    });
  }
}

// ========================================================
// 🔹 PARTIE 3 — MODALE : OUVERTURE/FERMETURE
// ========================================================

const modal = document.getElementById("modal");
const openModalBtn = document.querySelector(".edit-button");
const closeModalBtn = document.querySelector(".modal-close");

openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(data => {
      afficherGalerieModale(data);
    });
});

closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ========================================================
// 🔹 PARTIE 4 — MODALE : AFFICHAGE MINIATURES + SUPPRESSION
// ========================================================

function afficherGalerieModale(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";

  works.forEach(work => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;

    deleteBtn.addEventListener("click", () => {
      supprimerTravail(work.id, figure);
    });

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

function supprimerTravail(id, element) {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(response => {
      if (response.ok) {
        element.remove();
      } else {
        alert("La suppression du projet a échoué.");
      }
    })
    .catch(() => alert("Une erreur est survenue lors de la suppression."));
}

// ========================================================
// 🔹 PARTIE 5 — AJOUT PROJET
// ========================================================

const modalViewGallery = document.querySelector(".modal-view-gallery");
const modalViewAdd = document.querySelector(".modal-view-add");
const addPhotoBtn = document.querySelector(".modal-add-button");
const backBtn = document.querySelector(".modal-back-button");
const addForm = document.getElementById("add-form");

addPhotoBtn.addEventListener("click", () => {
  modalViewGallery.style.display = "none";
  modalViewAdd.style.display = "block";
});

backBtn.addEventListener("click", () => {
  modalViewAdd.style.display = "none";
  modalViewGallery.style.display = "block";
});

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

addForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Vous devez être connecté pour ajouter un projet.");
    return;
  }

  const formData = new FormData();
  formData.append("image", fileInput.files[0]); // ✅ input caché
  formData.append("title", document.getElementById("title").value);
  formData.append("category", document.getElementById("category").value);

  if (!formData.get("image") || !formData.get("title") || !formData.get("category")) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    body: formData,
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(response => {
      if (response.status === 200 || response.status === 201) {
        return response.json();
      } else {
        throw new Error("Erreur serveur : " + response.status);
      }
    })
    .then(newWork => {
      ajouterProjetDansGalerie(newWork);
      fetch("http://localhost:5678/api/works")
        .then(res => res.json())
        .then(data => afficherGalerieModale(data));

      addForm.reset();
      resetImagePreview();
      modalViewAdd.style.display = "none";
      modalViewGallery.style.display = "block";
    })
    .catch(error => {
      alert("Impossible d'ajouter le projet.");
      console.error(error);
    });
});

// ========================================================
// 🔹 PARTIE 6 — PREVIEW IMAGE (corrigée pour ton HTML)
// ========================================================

// On crée un input file caché pour remplacer le bouton "Ajouter photo"
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/jpeg, image/png";
fileInput.id = "image"; // utile pour FormData
fileInput.style.display = "none";
document.body.appendChild(fileInput);

const addButton = document.querySelector(".ajouter");       // bouton "+ Ajouter photo"
const preview = document.getElementById("image-preview");   // conteneur preview
const formatText = document.querySelector(".format_image"); // texte "jpg, png : 4mo max"

let selectedFile = null;

// Clic sur bouton → ouvre l'input caché
addButton.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput.click();
});

// Quand un fichier est choisi
fileInput.addEventListener("change", () => {
  updateImageDisplay(fileInput.files);
});

// Fonction d'affichage de la preview
function updateImageDisplay(files) {
  if (files.length === 0) {
    resetImagePreview();
    return;
  }

  const file = files[0];
  if (validFileType(file)) {
    selectedFile = file;
    addButton.style.display = "none";
    formatText.style.display = "none";
    preview.innerHTML = "";

    const img = document.createElement("img");
    img.src = window.URL.createObjectURL(file);
    img.classList.add("preview-image");
    preview.appendChild(img);
  } else {
    preview.innerHTML = `<p style="color:red;">Format non valide (jpg, png uniquement)</p>`;
    selectedFile = null;
  }
}

function resetImagePreview() {
  preview.innerHTML = '<p><i class="fa-solid fa-image"></i></p>';
  addButton.style.display = "inline-block";
  formatText.style.display = "block";
  selectedFile = null;
}

const fileTypes = ["image/jpeg", "image/png"];
function validFileType(file) {
  return fileTypes.includes(file.type);
}
