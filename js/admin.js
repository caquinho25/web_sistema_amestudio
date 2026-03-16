let students = [];

const studentForm = document.getElementById("studentForm");
const scoreForm = document.getElementById("scoreForm");

const studentsTable = document.getElementById("studentsTable");
const studentSelect = document.getElementById("studentSelect");



studentForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const usuario = document.getElementById("usuario").value;

    const student = {
        id: Date.now(),
        nombre,
        apellido,
        usuario,
        notas: []
    };

    students.push(student);

    renderStudents();

    studentForm.reset();

});



scoreForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const studentId = studentSelect.value;
    const semana = document.getElementById("semana").value;
    const nota = parseFloat(document.getElementById("nota").value);

    const student = students.find(s => s.id == studentId);

    student.notas.push({
        semana,
        nota
    });

    scoreForm.reset();

});



function renderStudents() {

    studentsTable.innerHTML = "";
    studentSelect.innerHTML = '<option value="">Seleccionar alumno</option>';

    students.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
<td>${student.nombre} ${student.apellido}</td>
<td>${student.usuario}</td>
<td>
<button class="delete-btn" onclick="deleteStudent(${student.id})">
Eliminar
</button>
</td>
`;

        studentsTable.appendChild(row);

        const option = document.createElement("option");

        option.value = student.id;
        option.textContent = student.nombre + " " + student.apellido;

        studentSelect.appendChild(option);

    });

}



function deleteStudent(id) {

    students = students.filter(student => student.id !== id);

    renderStudents();

}