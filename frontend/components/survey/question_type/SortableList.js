import StackedBar from '../chart_container/StackedBar';

import { Button } from '@material-ui/core';

const SortableList = ({
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
            </div>
            <StackedBar
                direction={'vertical'}
                chartIndex={index}
                chartQuestion={reportState.question}
                chartData={reportState.standardlizedData}
                chartColors={reportState.colors}
                chartChoices={reportState.choices}
                updateColor={updateColor} />

        </div>
    );
}

export default SortableList;