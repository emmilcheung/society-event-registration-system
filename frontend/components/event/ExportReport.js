export const exportHTML = (reportStates, title) => {
	console.log(reportStates);
	// var state = reportStates[0];
	var html = `<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="X-UA-Compatible" content="IE=edge">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
					<title>Report</title>
				</head>
								<style>
									.body_container {
										width: 100%;
										margin: 30px 10vw;
										padding: 0 auto;
										display: grid;
										grid-gap: 10px;
										grid-template-columns: repeat(auto-fill, 600px)
									}
									canvas{
										width: 400px;
										max-height :441px !important;
									}
								</style>
				<body>
					<div class="report">
						<div style="display: flex;  justify-content: center;;">
						<div style="width: 90vw; padding:0 auto;">
							<div class="question_title">
							<h1>${title}</h1>
							</div>
							<div class="body_container">
								${constructCanvas(reportStates)}
							</div>
						</div>
						</div>
					</div>
				</body>
				<script>
									${constructScript(reportStates)}
					</script>
				</html>`;
	const blob = new Blob(["\ufeff", html], { type: 'text/html' })
	const a = document.createElement('a');
	a.setAttribute('hidden', '')
	a.setAttribute('href', window.URL.createObjectURL(blob))
	a.setAttribute('download', 'participant.html')
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

const arrayToString = (array) => {
	return `['${array.join("','")}']`;
}

const constructCanvas = (reportStates) => {
	return reportStates.map((_, i) => {
		return `<div style="width: min(800px, 100%); height: 100%; margin-top: 30px">
				<canvas id="myChart${i}"></canvas>
				</div>`
	}).join('\n')
}

const pieOption =
	`{
        responsive: true,
        plugins: {
            datalabels: {
                display: true,
                color: 'white'
            }
        }
    }`

const barOption =
	`{
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    min: 0
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    min: 0
                }
            }]
        },
    }`


const constructScript = (reportStates) => {
	return reportStates.map((state, i) => {
		return `const data${i} = {
							labels: ${arrayToString(state.data.labels)},
							datasets: [{
								label: \`${state.data.datasets[0].label}\`,
								backgroundColor: ${arrayToString(state.data.datasets[0].backgroundColor)},
								borderColor: '#FFF',
								data: ${arrayToString(state.data.datasets[0].data)},
							}]
						};
						const config${i} = {
							type: '${state.type}',
							data: data${i},
							options: 
								${state.type == 'bar' ? barOption : pieOption}
						};
						var myChart = new Chart(
							document.getElementById('myChart${i}'),
							config${i}
						);`
	}).join('\n')
}