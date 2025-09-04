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

    // Création des filtres
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
  formData.append("image", document.getElementById("image").files[0]);
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
      resetImagePreview(document.getElementById("image-preview"));
      modalViewAdd.style.display = "none";
      modalViewGallery.style.display = "block";
    })
    .catch(error => {
      alert("Impossible d'ajouter le projet.");
      console.error(error);
    });
});

// ========================================================
// 🔹 PARTIE 6 — PREVIEW IMAGE
// ========================================================

function resetImagePreview(preview) {
  preview.innerHTML = "";
  preview.classList.remove("has-image");
}

function handleFileInput(event) {
  const preview = document.getElementById("image-preview");
  const file = event.target.files[0];

  if (!file) {
    resetImagePreview(preview);
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png"];
  const maxSizeInBytes = 4 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    alert("Format invalide ! JPG ou PNG requis.");
    event.target.value = "";
    resetImagePreview(preview);
    return;
  }

  if (file.size > maxSizeInBytes) {
    alert("Fichier trop volumineux ! Maximum 4 Mo.");
    event.target.value = "";
    resetImagePreview(preview);
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    resetImagePreview(preview);
    const imgPreview = document.createElement("img");
    imgPreview.src = e.target.result;
    imgPreview.alt = "Aperçu de l'image";
    imgPreview.style.maxWidth = "150px";
    imgPreview.style.borderRadius = "8px";
    preview.appendChild(imgPreview);
    preview.classList.add("has-image");
  };
  reader.readAsDataURL(file);
}

document.getElementById("image").addEventListener("change", handleFileInput);
