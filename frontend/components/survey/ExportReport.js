export const exportHTML = (reportStates, title) => {
	var state = reportStates[0];
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
										border-radius: max(0px, min(8px, ((100vw - 4px) - 100%) * 9999)) / 8px;
										overflow: hidden;
										padding: calc(1.325rem + 0.9vw) calc(1.325rem + 0.9vw) calc(1.375rem + 1.5vw);
									}
									canvas{
										max-height :441px !important;
									}
								</style>
                <body>
                    <div class="report">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 50vw;">
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
	console.log(html);
	const blob = new Blob(["\ufeff", html], { type: 'text/html' })
	const a = document.createElement('a');
	a.setAttribute('hidden', '')
	a.setAttribute('href', window.URL.createObjectURL(blob))
	a.setAttribute('download', 'report.html')
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

const arrayToString = (array) => {
	return `['${array.join("','")}']`;
}

const constructCanvas = (reportStates) => {
	return reportStates.map((state, i) => {

		return `
		<h3>${state.question.title}</h3>
		<div style="position: relative;"><canvas id="myChart${i}"></canvas></div>`
	}).join('\n')
}

const optionHorizontalBar =
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
	indexAxis: 'y',
}`

const optionVerticalBar =
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

const setSortableListDataset = (dataset, colors, title) => {
	// TODO => #1 
	return `{
				label: \`${title}\`,
				backgroundColor: '${colors}',
				borderColor: '#FFF',
				data: ${arrayToString(dataset)},
			}`
}

const constructScript = (reportStates) => {
	return reportStates.map((state, i) => {
		if (state.question.type == "sortablelist") {
			return `const data${i} = {
				labels: ${arrayToString(state.choices)},
				datasets: [
					${state.standardlizedData
					.map((dataset, index) => setSortableListDataset(dataset, state.colors[index], state.choices[index])).join(',')
				}
				]
			};
			const config${i} = {
				type: '${(state.chartMode == 'vertical' || state.chartMode == 'horizontal') ? 'bar' : 'pie'}',
				data: data${i},
				options: 
				${optionVerticalBar}

			};
			var myChart = new Chart(
				document.getElementById('myChart${i}'),
				config${i}
				);`
		}
		else {
			return `const data${i} = {
				labels: ${arrayToString(state.choices)},
				datasets: [{
					label: \`${state.question.title}\`,
					backgroundColor: ${arrayToString(state.colors)},
					borderColor: '#FFF',
					data: ${arrayToString(state.standardlizedData)},
				}]
			};
			const config${i} = {
				type: '${(state.chartMode == 'vertical' || state.chartMode == 'horizontal') ? 'bar' : 'pie'}',
				data: data${i},
				options: 
				${state.chartMode == 'vertical'
					? optionVerticalBar
					: state.chartMode == 'horizontal'
						? optionHorizontalBar
						: '{}'}
			};
			var myChart = new Chart(
				document.getElementById('myChart${i}'),
				config${i}
				);`
		}
	}).join('\n')
}

