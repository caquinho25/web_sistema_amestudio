const alumno = JSON.parse(localStorage.getItem("alumno") || "null");
if (!alumno) {
  window.location.href = "index.html";
}

document.getElementById("welcomeText").textContent =
  `Hola de nuevo, ${alumno.nombre} ${alumno.apellido}`;

document.getElementById("nombre-navbar").textContent =
  `${alumno.nombre} ${alumno.apellido}`;

const canvas = document.getElementById("progressChart");
const ctx = canvas.getContext("2d");
let chart = null;

function calcularArea(buenas, malas, valorBuena){
  let nota = (Number(buenas) * valorBuena) - (Number(malas) * 0.17);
  if (isNaN(nota)) nota = 0;
  if (nota < 0) nota = 0;
  if (nota > 20) nota = 20;
  return nota;
}

function calcularNotasAreas(data){
  return {
    rv: calcularArea(data.rv_buenas, data.rv_malas, 0.8),
    rm: calcularArea(data.rm_buenas, data.rm_malas, 0.8),
    mat: calcularArea(data.mat_buenas, data.mat_malas, 1.1111),
    fis: calcularArea(data.fis_buenas, data.fis_malas, 3.3333),
    qui: calcularArea(data.qui_buenas, data.qui_malas, 3.3333),
    bio: calcularArea(data.bio_buenas, data.bio_malas, 3.3333),
    cs:  calcularArea(data.cs_buenas, data.cs_malas, 1.4286),
  };
}

function calcularNotaFinal(notas){
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

async function obtenerSimulacros() {
  try {
    const { data, error } = await db
      .from('simulacros')
      .select('*')
      .eq('alumno_id', alumno.id)
      .order('semana', { ascending: true });

    if (error) {
      console.error("Error al traer simulacros:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Error inesperado al obtener simulacros:", err);
    return [];
  }
}

function prepararSeries(simulacros){
  // labels: S1, S2, ...
  const semanas = simulacros.map(s => `S${s.semana}`);
  const notas = simulacros.map(s => Number((s.nota_final ?? 0)));
  return { semanas, notas };
}

function crearOModificarGrafico(labels, dataValues){
  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Nota final',
        data: dataValues,
        borderColor: '#6CA651',
        backgroundColor: 'rgba(108,166,81,0.18)',
        tension: 0.35,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        pointBackgroundColor: '#6CA651'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.0,
      layout: { padding: { top: 6, right: 12, bottom: 6, left: 6 } },
      scales: {
        y: {
          min: 0,
          max: 20,
          ticks: {
            stepSize: 2,
            callback: v => Number(v).toFixed(0),
            font: { size: 8 },
            color: '#334155',
            padding: 6
          },
          grid: { color: 'rgba(15,23,42,0.06)' },
        },
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 12,
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
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context){
              const v = context.parsed.y;
              return 'Nota: ' + Number(v).toFixed(4);
            }
          }
        }
      },
      elements: { point: { hoverRadius: 6 } },
      animation: { duration: 600, easing: 'easeOutCubic' }
    }
  };

  if (chart) {
    chart.options = config.options;
    chart.data.labels = config.data.labels;
    chart.data.datasets = config.data.datasets;
    chart.update();
  } else {
    chart = new Chart(ctx, config);
  }
}

function obtenerMejorNota(simulacros){
  if(!simulacros || simulacros.length === 0) return 0;
  return Math.max(...simulacros.map(s => Number(s.nota_final ?? 0)));
}

function obtenerUltimaNota(simulacros){
  if(!simulacros || simulacros.length === 0) return 0;
  return Number(simulacros[simulacros.length - 1].nota_final ?? 0);
}

function mostrarAreasDelUltimo(simulacros){

  if(!simulacros || simulacros.length === 0){
    // limpiar
    const ids = ['resRV','resRM','resMAT','resFIS','resQUI','resBIO','resCS'];
    ids.forEach(id => { const el = document.getElementById(id); if(el) el.textContent = '-'; });
    return;
  }

  const ult = simulacros[simulacros.length - 1];

  const dataFromDb = {
    rv_buenas: ult.rv_buenas ?? 0, rv_malas: ult.rv_malas ?? 0,
    rm_buenas: ult.rm_buenas ?? 0, rm_malas: ult.rm_malas ?? 0,
    mat_buenas: ult.mat_buenas ?? 0, mat_malas: ult.mat_malas ?? 0,
    fis_buenas: ult.fis_buenas ?? 0, fis_malas: ult.fis_malas ?? 0,
    qui_buenas: ult.qui_buenas ?? 0, qui_malas: ult.qui_malas ?? 0,
    bio_buenas: ult.bio_buenas ?? 0, bio_malas: ult.bio_malas ?? 0,
    cs_buenas: ult.cs_buenas ?? 0, cs_malas: ult.cs_malas ?? 0,
  };

  const notas = calcularNotasAreas(dataFromDb);

  const map = {
    resRV: notas.rv,
    resRM: notas.rm,
    resMAT: notas.mat,
    resFIS: notas.fis,
    resQUI: notas.qui,
    resBIO: notas.bio,
    resCS:  notas.cs
  };

  for (const id in map){
    const el = document.getElementById(id);
    if (el) el.textContent = Number(map[id]).toFixed(4);
  }

  const alumnoNombreEl = document.getElementById("resAlumno");
  const semanaEl = document.getElementById("resSemana");
  const notaEl = document.getElementById("resNota");

  if (alumnoNombreEl) alumnoNombreEl.textContent = `${alumno.nombre} ${alumno.apellido}`;
  if (semanaEl) semanaEl.textContent = ult.semana ?? '-';
  if (notaEl) notaEl.textContent = Number(ult.nota_final ?? 0).toFixed(4);
}

async function cargarDashboard(){
  const simulacros = await obtenerSimulacros();
  const { semanas, notas } = prepararSeries(simulacros);

  crearOModificarGrafico(semanas, notas);

  const mejor = obtenerMejorNota(simulacros);
  const ultima = obtenerUltimaNota(simulacros);

  const mejorEl = document.getElementById("mejorNota");
  const ultimaEl = document.getElementById("ultimaNota");

  if (mejorEl) mejorEl.textContent = Number(mejor).toFixed(4);
  if (ultimaEl) ultimaEl.textContent = Number(ultima).toFixed(4);

  mostrarAreasDelUltimo(simulacros);
}

cargarDashboard();

document.querySelector(".logout-btn").addEventListener("click", () => {
  localStorage.removeItem("alumno");
  window.location.href = "index.html";
});