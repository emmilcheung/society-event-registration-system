import BarChartContainer from '../chart_container/BarChartContainer';
import PieChartContainer from '../chart_container/PieChartContainer';

import { Button } from '@material-ui/core';

const SingleChoice = ({
    index,
    reportState,
    updateChartMode,
    updateColor,
}) => {
    return (
        <div key={index} style={{ width: "60vw", }}>
            <div className="question_title">
                <h5>
                    {reportState.question.title} ({reportState.question.name})
                    </h5>
            </div>
            <div className="">
                <Button
                    onClick={() => updateChartMode(index, 'vertical')}
                >
                    Vertical
            </Button>
                <Button
                    onClick={() => updateChartMode(index, 'horizontal')}
                >
                    Horizontal
            </Button>
                <Button
                    onClick={() => updateChartMode(index, 'pie')}
                >
                    Pie
            </Button>
            </div>
            {
                reportState.chartMode == 'vertical' &&
                <BarChartContainer
                    direction={'vertical'}
                    chartIndex={index}
                    chartQuestion={reportState.question}
                    chartData={reportState.standardlizedData}
                    chartColors={reportState.colors}
                    chartChoices={reportState.choices}
                    updateColor={updateColor} />

            }
            {
                reportState.chartMode == 'horizontal' &&
                <BarChartContainer
                    direction={'horizontal'}
                    chartIndex={index}
                    chartQuestion={reportState.question}
                    chartData={reportState.standardlizedData}
                    chartColors={reportState.colors}
                    chartChoices={reportState.choices}
                    updateColor={updateColor} />

            }
            {
                reportState.chartMode == 'pie' &&
                <PieChartContainer
                    chartIndex={index}
                    chartQuestion={reportState.question}
                    chartData={reportState.standardlizedData}
                    chartColors={reportState.colors}
                    chartChoices={reportState.choices}
                    updateColor={updateColor} />
            }
        </div>
    );
}

export default SingleChoice;