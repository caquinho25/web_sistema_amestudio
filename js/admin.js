if (!localStorage.getItem("admin")) {
  window.location.href = "index.html";
}

const studentForm = document.getElementById("studentForm");
const scoreForm = document.getElementById("scoreForm");

const studentsTable = document.getElementById("studentsTable");
const studentSelect = document.getElementById("studentSelect");

const submitBtn = scoreForm ? scoreForm.querySelector(".submit-btn") : null;

const studentChartSelect = document.getElementById("studentChartSelect");
const adminChartMessage = document.getElementById("adminChartMessage");
let adminChart = null;

const chartAlumnoNombre = document.getElementById("chartAlumnoNombre");
const chartSemana = document.getElementById("chartSemana");
const chartNotaFinal = document.getElementById("chartNotaFinal");

const chartRV = document.getElementById("chartRV");
const chartRM = document.getElementById("chartRM");
const chartMAT = document.getElementById("chartMAT");
const chartFIS = document.getElementById("chartFIS");
const chartQUI = document.getElementById("chartQUI");
const chartBIO = document.getElementById("chartBIO");
const chartCS = document.getElementById("chartCS");

function format4(n) {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0.0000";
  return num.toFixed(4);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function calcularArea(buenas, malas, valorBuena) {
  let nota = (Number(buenas) * valorBuena) - (Number(malas) * 0.17);

  if (Number.isNaN(nota)) nota = 0;
  if (nota < 0) nota = 0;
  if (nota > 20) nota = 20;

  return nota;
}

function calcularNotasAreas(data) {
  return {
    rv: calcularArea(data.rv_buenas, data.rv_malas, 0.8),
    rm: calcularArea(data.rm_buenas, data.rm_malas, 0.8),
    mat: calcularArea(data.mat_buenas, data.mat_malas, 1.1111),
    fis: calcularArea(data.fis_buenas, data.fis_malas, 3.3333),
    qui: calcularArea(data.qui_buenas, data.qui_malas, 3.3333),
    bio: calcularArea(data.bio_buenas, data.bio_malas, 3.3333),
    cs: calcularArea(data.cs_buenas, data.cs_malas, 1.4286),
  };
}

function calcularNotaFinal(notas) {
  return (
    notas.rv * 0.25 +
    notas.rm * 0.25 +
    notas.mat * 0.18 +
    notas.fis * 0.06 +
    notas.qui * 0.06 +
    notas.bio * 0.06 +
    notas.cs * 0.14
  );
}

function validarLimites(data) {
  if ((data.rv_buenas + data.rv_malas) > 25) {
    alert("RV supera el límite de 25 preguntas");
    return false;
  }

  if ((data.rm_buenas + data.rm_malas) > 25) {
    alert("RM supera el límite de 25 preguntas");
    return false;
  }

  if ((data.mat_buenas + data.mat_malas) > 18) {
    alert("Matemática supera el límite de 18 preguntas");
    return false;
  }

  if ((data.fis_buenas + data.fis_malas) > 6) {
    alert("Física supera el límite de 6 preguntas");
    return false;
  }

  if ((data.qui_buenas + data.qui_malas) > 6) {
    alert("Química supera el límite de 6 preguntas");
    return false;
  }

  if ((data.bio_buenas + data.bio_malas) > 6) {
    alert("Biología supera el límite de 6 preguntas");
    return false;
  }

  if ((data.cs_buenas + data.cs_malas) > 14) {
    alert("Ciencias Sociales supera el límite de 14 preguntas");
    return false;
  }

  return true;
}

function validarNegativosYNaN(data) {
  const keys = [
    "rv_buenas", "rv_malas",
    "rm_buenas", "rm_malas",
    "mat_buenas", "mat_malas",
    "fis_buenas", "fis_malas",
    "qui_buenas", "qui_malas",
    "bio_buenas", "bio_malas",
    "cs_buenas", "cs_malas"
  ];

  for (const k of keys) {
    const val = Number(data[k]);
    if (Number.isNaN(val) || val < 0) {
      alert("Los valores de buenas/malas deben ser números válidos y no negativos.");
      return false;
    }
  }

  return true;
}

studentForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = studentForm.querySelector("button[type='submit']");

  try {
    btn.disabled = true;
    btn.textContent = "Creando...";

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    if (!nombre || !apellido || !usuario || !password) {
      alert("Completa todos los campos para crear el alumno.");
      return;
    }

    const { error } = await db
      .from("alumnos")
      .insert([{ nombre, apellido, usuario, password }]);

    if (error) {
      console.error("Error al crear alumno:", error);
      alert("Error al crear alumno. Revisa la consola.");
      return;
    }

    alert("Alumno creado correctamente");
    studentForm.reset();
    await renderStudents();

  } catch (err) {
    console.error("Error inesperado creando alumno:", err);
    alert("Ocurrió un error inesperado al crear alumno.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Crear alumno";
  }
});

scoreForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";
  }

  try {
    const alumno_id = studentSelect ? studentSelect.value : null;
    const semanaRaw = document.getElementById("semana").value;

    if (!alumno_id) {
      alert("Selecciona un alumno.");
      return;
    }

    const semana = parseInt(semanaRaw, 10);
    if (Number.isNaN(semana) || semana < 1 || semana > 20) {
      alert("La semana debe ser un número entre 1 y 20.");
      return;
    }

    const data = {
      rv_buenas: parseInt(document.getElementById("rv_buenas").value || 0, 10),
      rv_malas: parseInt(document.getElementById("rv_malas").value || 0, 10),

      rm_buenas: parseInt(document.getElementById("rm_buenas").value || 0, 10),
      rm_malas: parseInt(document.getElementById("rm_malas").value || 0, 10),

      mat_buenas: parseInt(document.getElementById("mat_buenas").value || 0, 10),
      mat_malas: parseInt(document.getElementById("mat_malas").value || 0, 10),

      fis_buenas: parseInt(document.getElementById("fis_buenas").value || 0, 10),
      fis_malas: parseInt(document.getElementById("fis_malas").value || 0, 10),

      qui_buenas: parseInt(document.getElementById("qui_buenas").value || 0, 10),
      qui_malas: parseInt(document.getElementById("qui_malas").value || 0, 10),

      bio_buenas: parseInt(document.getElementById("bio_buenas").value || 0, 10),
      bio_malas: parseInt(document.getElementById("bio_malas").value || 0, 10),

      cs_buenas: parseInt(document.getElementById("cs_buenas").value || 0, 10),
      cs_malas: parseInt(document.getElementById("cs_malas").value || 0, 10),
    };

    if (!validarNegativosYNaN(data)) return;
    if (!validarLimites(data)) return;

    const { data: existentes, error: checkError } = await db
      .from("simulacros")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("semana", semana)
      .limit(1);

    if (checkError) {
      console.error("Error al verificar duplicado:", checkError);
      alert("Error al verificar duplicado. Reintenta.");
      return;
    }

    if (existentes && existentes.length > 0) {
      alert("❌ Ya existe una nota registrada para esa semana y alumno.");
      return;
    }

    const notasAreas = calcularNotasAreas(data);
    let notaFinal = calcularNotaFinal(notasAreas);
    notaFinal = Number(notaFinal.toFixed(4));

    const { error: insertError } = await db
      .from("simulacros")
      .insert([{
        alumno_id,
        semana,
        ...data,
        nota_final: notaFinal
      }]);

    if (insertError) {
      console.error("Error insertando simulacro:", insertError);
      alert("Error al guardar la nota en la base de datos.");
      return;
    }

    alert("Simulacro registrado correctamente ✅");

    const alumnoNombre = studentSelect.selectedOptions[0]
      ? studentSelect.selectedOptions[0].text
      : "Alumno";

    if (document.getElementById("resAlumno")) document.getElementById("resAlumno").textContent = alumnoNombre;
    if (document.getElementById("resSemana")) document.getElementById("resSemana").textContent = semana;
    if (document.getElementById("resNota")) document.getElementById("resNota").textContent = format4(notaFinal);

    if (document.getElementById("resRV")) document.getElementById("resRV").textContent = format4(notasAreas.rv);
    if (document.getElementById("resRM")) document.getElementById("resRM").textContent = format4(notasAreas.rm);
    if (document.getElementById("resMAT")) document.getElementById("resMAT").textContent = format4(notasAreas.mat);
    if (document.getElementById("resFIS")) document.getElementById("resFIS").textContent = format4(notasAreas.fis);
    if (document.getElementById("resQUI")) document.getElementById("resQUI").textContent = format4(notasAreas.qui);
    if (document.getElementById("resBIO")) document.getElementById("resBIO").textContent = format4(notasAreas.bio);
    if (document.getElementById("resCS")) document.getElementById("resCS").textContent = format4(notasAreas.cs);

    if (studentChartSelect && studentChartSelect.value === alumno_id) {
      await cargarGraficoAlumnoAdmin(alumno_id);
    }

    scoreForm.reset();
    await renderStudents();

  } catch (err) {
    console.error("Error inesperado:", err);
    alert("Ocurrió un error inesperado. Revisa la consola.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Registrar nota";
    }
  }
});

async function renderStudents() {
  try {
    const { data, error } = await db
      .from("alumnos")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error al traer alumnos:", error);
      return;
    }

    studentsTable.innerHTML = "";
    studentSelect.innerHTML = '<option value="">Seleccionar alumno</option>';

    if (studentChartSelect) {
      studentChartSelect.innerHTML = '<option value="">Seleccionar alumno para ver gráfico</option>';
    }

    if (!data || data.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="3" style="color:#64748b;">No hay alumnos</td>`;
      studentsTable.appendChild(tr);
      return;
    }

    data.forEach(student => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(student.nombre)} ${escapeHtml(student.apellido)}</td>
        <td>${escapeHtml(student.usuario)}</td>
        <td>
          <button class="delete-btn" data-id="${student.id}">Eliminar</button>
        </td>
      `;
      studentsTable.appendChild(row);

      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = `${student.nombre} ${student.apellido}`;
      studentSelect.appendChild(option);

      if (studentChartSelect) {
        const chartOption = document.createElement("option");
        chartOption.value = student.id;
        chartOption.textContent = `${student.nombre} ${student.apellido}`;
        studentChartSelect.appendChild(chartOption);
      }
    });

    studentsTable.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (ev) => {
        const id = ev.currentTarget.getAttribute("data-id");
        if (id) deleteStudent(id);
      });
    });

  } catch (err) {
    console.error("Error renderizando alumnos:", err);
  }
}

async function deleteStudent(id) {
  try {
    if (!confirm("¿Eliminar este alumno? Esta acción no se puede deshacer.")) return;

    const { error } = await db
      .from("alumnos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando alumno:", error);
      alert("Error al eliminar alumno.");
      return;
    }

    if (studentChartSelect && studentChartSelect.value === id) {
      studentChartSelect.value = "";

      if (adminChart) {
        adminChart.destroy();
        adminChart = null;
      }

      if (adminChartMessage) {
        adminChartMessage.textContent = "Selecciona un alumno para visualizar su progreso.";
      }

      mostrarResumenAlumnoAdmin("-", []);
    }

    await renderStudents();

  } catch (err) {
    console.error("Error eliminando alumno:", err);
  }
}

async function obtenerSimulacrosAlumno(alumnoId) {
  const { data, error } = await db
    .from("simulacros")
    .select("*")
    .eq("alumno_id", alumnoId)
    .order("semana", { ascending: true });

  if (error) {
    console.error("Error al obtener simulacros del alumno:", error);
    return [];
  }

  return data || [];
}

function crearOModificarGraficoAdmin(labels, dataValues) {
  const canvas = document.getElementById("adminProgressChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const config = {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Nota final",
        data: dataValues,
        borderColor: "#6CA651",
        backgroundColor: "rgba(108,166,81,0.18)",
        tension: 0.35,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: "#6CA651"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      scales: {
        y: {
          min: 0,
          max: 20,
          ticks: {
            stepSize: 2,
            font: { size: 8 },
            color: '#334155',
            padding: 6
          }
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 0,
            font: { size: 8 },
            color: '#334155',
            padding: 6
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  };

  if (adminChart) {
    adminChart.data.labels = labels;
    adminChart.data.datasets[0].data = dataValues;
    adminChart.update();
  } else {
    adminChart = new Chart(ctx, config);
  }
}

function mostrarResumenAlumnoAdmin(alumnoNombre, simulacros) {
  if (!simulacros || simulacros.length === 0) {
    if (chartAlumnoNombre) chartAlumnoNombre.textContent = "-";
    if (chartSemana) chartSemana.textContent = "-";
    if (chartNotaFinal) chartNotaFinal.textContent = "-";

    if (chartRV) chartRV.textContent = "-";
    if (chartRM) chartRM.textContent = "-";
    if (chartMAT) chartMAT.textContent = "-";
    if (chartFIS) chartFIS.textContent = "-";
    if (chartQUI) chartQUI.textContent = "-";
    if (chartBIO) chartBIO.textContent = "-";
    if (chartCS) chartCS.textContent = "-";
    return;
  }

  const ultimo = simulacros[simulacros.length - 1];

  const notasAreas = calcularNotasAreas({
    rv_buenas: ultimo.rv_buenas,
    rv_malas: ultimo.rv_malas,

    rm_buenas: ultimo.rm_buenas,
    rm_malas: ultimo.rm_malas,

    mat_buenas: ultimo.mat_buenas,
    mat_malas: ultimo.mat_malas,

    fis_buenas: ultimo.fis_buenas,
    fis_malas: ultimo.fis_malas,

    qui_buenas: ultimo.qui_buenas,
    qui_malas: ultimo.qui_malas,

    bio_buenas: ultimo.bio_buenas,
    bio_malas: ultimo.bio_malas,

    cs_buenas: ultimo.cs_buenas,
    cs_malas: ultimo.cs_malas
  });

  if (chartAlumnoNombre) chartAlumnoNombre.textContent = alumnoNombre;
  if (chartSemana) chartSemana.textContent = ultimo.semana;
  if (chartNotaFinal) chartNotaFinal.textContent = format4(ultimo.nota_final);

  if (chartRV) chartRV.textContent = format4(notasAreas.rv);
  if (chartRM) chartRM.textContent = format4(notasAreas.rm);
  if (chartMAT) chartMAT.textContent = format4(notasAreas.mat);
  if (chartFIS) chartFIS.textContent = format4(notasAreas.fis);
  if (chartQUI) chartQUI.textContent = format4(notasAreas.qui);
  if (chartBIO) chartBIO.textContent = format4(notasAreas.bio);
  if (chartCS) chartCS.textContent = format4(notasAreas.cs);
}

async function cargarGraficoAlumnoAdmin(alumnoId) {
  if (!studentChartSelect || !adminChartMessage) return;

  if (!alumnoId) {
    adminChartMessage.textContent = "Selecciona un alumno para visualizar su progreso.";
    mostrarResumenAlumnoAdmin("-", []);

    if (adminChart) {
      adminChart.destroy();
      adminChart = null;
    }
    return;
  }

  const simulacros = await obtenerSimulacrosAlumno(alumnoId);

  if (simulacros.length === 0) {
    adminChartMessage.textContent = "Este alumno aún no tiene simulacros registrados.";

    const alumnoNombre = studentChartSelect.selectedOptions[0]
      ? studentChartSelect.selectedOptions[0].text
      : "-";

    mostrarResumenAlumnoAdmin(alumnoNombre, []);

    if (adminChart) {
      adminChart.destroy();
      adminChart = null;
    }
    return;
  }

  adminChartMessage.textContent = "";

  const alumnoNombre = studentChartSelect.selectedOptions[0]
    ? studentChartSelect.selectedOptions[0].text
    : "-";

  const semanas = simulacros.map(s => `S${s.semana}`);
  const notas = simulacros.map(s => s.nota_final);

  crearOModificarGraficoAdmin(semanas, notas);
  mostrarResumenAlumnoAdmin(alumnoNombre, simulacros);
}

if (studentChartSelect) {
  studentChartSelect.addEventListener("change", (e) => {
    cargarGraficoAlumnoAdmin(e.target.value);
  });
}

document.querySelector(".logout-btn").addEventListener("click", () => {
  localStorage.removeItem("admin");
  window.location.href = "index.html";
});

renderStudents();