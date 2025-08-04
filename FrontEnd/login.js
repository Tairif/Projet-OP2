const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      errorMsg.textContent = "Identifiants incorrects.";
    }
  } catch (error) {
    errorMsg.textContent = "Erreur lors de la connexion.";
    console.error("Erreur :", error);
  }
});
