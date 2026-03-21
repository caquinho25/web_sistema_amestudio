const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

const ADMIN_USER = "admin";
const ADMIN_PASS = "Giancarlo25";

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(e){

  e.preventDefault();

  const usuario = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  // LOGIN ADMIN
  if(usuario === ADMIN_USER && password === ADMIN_PASS){
    localStorage.setItem("admin", "true");
    window.location.href = "admin.html";
    return;
  }

  // LOGIN ALUMNO
  const { data, error } = await db
    .from('alumnos')
    .select('*')
    .eq('usuario', usuario)
    .eq('password', password)
    .single();

  if(error || !data){
    alert("Usuario o contraseña incorrectos");
    return;
  }

  // guardar sesión
  localStorage.setItem("alumno", JSON.stringify(data));

  // redirigir
  window.location.href = "dashboard.html";

});
