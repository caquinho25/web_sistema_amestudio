let students = [];

const studentForm = document.getElementById("studentForm");
const scoreForm = document.getElementById("scoreForm");

const studentsTable = document.getElementById("studentsTable");
const studentSelect = document.getElementById("studentSelect");

if(!localStorage.getItem("admin")){
  window.location.href = "index.html";
}

studentForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const { data, error } = await db
        .from('alumnos')
        .insert([
            { nombre, apellido, usuario, password }
        ]);

    if (error) {
        console.log(error);
        alert("Error al crear alumno");
    } else {
        alert("Alumno creado correctamente");
    }

    renderStudents();

    studentForm.reset();
});



scoreForm.addEventListener("submit", async function(e){
  e.preventDefault();

  const alumno_id = studentSelect.value;
  const semana = parseInt(document.getElementById("semana").value);
  const nota = parseFloat(document.getElementById("nota").value);

  // VALIDAR semana repetida
  const { data: existentes, error: errorCheck } = await db
    .from('simulacros')
    .select('*')
    .eq('alumno_id', alumno_id)
    .eq('semana', semana);

  if(existentes.length > 0){
    alert("Ya existe una nota para esa semana");
    return;
  }

  if(nota < 0 || nota > 20){
  alert("❌ La nota debe estar entre 0 y 20");
  return;
  }

  // INSERTAR
  const { error } = await db
    .from('simulacros')
    .insert([{ alumno_id, semana, nota }]);

  if(error){
    alert("Error al guardar");
    return;
  }

  alert("Nota registrada ✅");
  scoreForm.reset();

});



async function renderStudents() {

    const { data, error } = await db
        .from('alumnos')
        .select('*');

    studentsTable.innerHTML = "";
    studentSelect.innerHTML = '<option value="">Seleccionar alumno</option>';

    data.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
      <td>${student.nombre} ${student.apellido}</td>
      <td>${student.usuario}</td>
      <td>
        <button onclick="deleteStudent('${student.id}')">Eliminar</button>
      </td>
    `;

        studentsTable.appendChild(row);

        const option = document.createElement("option");
        option.value = student.id;
        option.textContent = student.nombre + " " + student.apellido;

        studentSelect.appendChild(option);

    });

}

async function deleteStudent(id){

  await db
    .from('alumnos')
    .delete()
    .eq('id', id);

  renderStudents();

}

renderStudents();

document.querySelector(".logout-btn").addEventListener("click", () => {
  localStorage.removeItem("admin");
  window.location.href = "index.html";
});