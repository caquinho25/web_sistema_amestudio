const alumno = JSON.parse(localStorage.getItem("alumno"));

if(!alumno){
  window.location.href = "index.html";
}

document.getElementById("welcomeText").textContent =
  `Hola de nuevo, ${alumno.nombre} ${alumno.apellido}`;
  
document.getElementById("nombre-navbar").textContent =
  `${alumno.nombre} ${alumno.apellido}`;


async function obtenerSimulacros() {

  const { data, error } = await db
    .from('simulacros')
    .select('*')
    .eq('alumno_id', alumno.id)
    .order('semana', { ascending: true });

  if(error){
    console.log(error);
    return [];
  }

  return data;
}


obtenerSimulacros().then(data => {
  console.log("SIMULACROS:", data);
});

function procesarDatos(simulacros){

  const semanas = simulacros.map(s => "Sem " + s.semana);
  const notas = simulacros.map(s => s.nota);

  return { semanas, notas };
}


async function cargarGrafico(){

  const simulacros = await obtenerSimulacros();

  const { semanas, notas } = procesarDatos(simulacros);

  const ctx = document.getElementById('progressChart');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: semanas,
      datasets: [{
        label: 'Notas',
        data: notas,
        borderColor: '#6CA651',
        backgroundColor: 'rgba(108,166,81,0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 20,
          ticks: {
            stepSize: 2
          }
        }
      },
      plugins:{
        legend:{ display:false }
      }
    }
  });

}

function obtenerMejorNota(simulacros){
  if(simulacros.length === 0) return 0;

  return Math.max(...simulacros.map(s => s.nota));
}


function obtenerUltimaNota(simulacros){
  if(simulacros.length === 0) return 0;

  return simulacros[simulacros.length - 1].nota;
}

async function cargarEstadisticas(){

  const simulacros = await obtenerSimulacros();

  const mejor = obtenerMejorNota(simulacros);
  const ultima = obtenerUltimaNota(simulacros);

  document.getElementById("mejorNota").textContent = mejor;
  document.getElementById("ultimaNota").textContent = ultima;

}

cargarGrafico();
cargarEstadisticas();


document.querySelector(".logout-btn").addEventListener("click", () => {
  localStorage.removeItem("alumno");
  window.location.href = "index.html";
});