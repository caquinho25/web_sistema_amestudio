const ctx = document.getElementById('progressChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
        datasets: [{
            label: 'Nota',
            data: [12, 15, 18, 14, 16, 17, 18, 19],
            borderColor: '#6CA651',
            backgroundColor: 'rgba(108,166,81,0.2)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            }
        }
    }
});