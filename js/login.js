const ADMIN_USER = "admin";
const ADMIN_PASS = "Giancarlo25";

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", () => {

  const hamburger = qs("#hamburger");
  const navMenu = qs("#navMenu");
  const loginForm = qs("#loginForm");
  const inputUser = qs("#loginUser");
  const inputPass = qs("#loginPass");
  const submitBtn = loginForm ? loginForm.querySelector("button[type='submit']") : null;

  if (hamburger) hamburger.setAttribute("aria-expanded", "false");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      const isActive = navMenu.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", String(isActive));
    });

    navMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navMenu.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = (inputUser && inputUser.value.trim()) || "";
    const password = (inputPass && inputPass.value) || "";

    if (!usuario || !password) {
      alert("Por favor completa usuario y contraseña.");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.origText = submitBtn.textContent;
      submitBtn.textContent = "Ingresando...";
    }

    try {
      if (usuario === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem("admin", "true");
        window.location.href = "admin.html";
        return;
      }

      const { data, error } = await db
        .from("alumnos")
        .select("*")
        .eq("usuario", usuario)
        .eq("password", password)
        .single();

      if (error || !data) {
        alert("Usuario o contraseña incorrectos.");
        return;
      }

      localStorage.setItem("alumno", JSON.stringify(data));

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Error en login:", err);
      alert("Ocurrió un error. Revisa la consola.");
    } finally {
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.origText || "Ingresar";
      }
    }
  });
});