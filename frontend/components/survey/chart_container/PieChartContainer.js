import { useEffect, useRef, useState } from "react";
import { Pie } from "react-chartjs-2"
import { SketchPicker } from 'react-color';

const PieChartContainer = ({
    chartIndex,
    chartQuestion,
    chartData,
    chartColors,
    chartChoices,
    updateColor,
}) => {
    const [state, setState] = useState({});
    const [sketchConfig, setSketchConfig] = useState({
        visiable: false,
        position: {
            x: 0,
            y: 0,
        },
        editId: 0,
    })

    useEffect(() => {
        answerBarChart();
    }, [])

    useEffect(() => {
        setState(prev => {
            return {
                labels: prev.labels,
                datasets: [
                    {
                        ...prev.datasets[0],
                        backgroundColor: [...chartColors]
                    }
                ],
            }
        })
    }, [...chartColors]);

    const onBarClick = (e) => {
        // [] for empth space. [ChartElement] when clicking the bar
        console.log(e);
        if (e.length) {
            var barObj = e[0];
            var barIndex = barObj._index;
                setSketchConfig({
                    visiable: true,
                    position: {
                        x: barObj._chart.width - 250, 
                        y: barObj._chart.height / 4 ,
                    },
                    editId: barIndex,
                })
            // }
        }
        else {
            setSketchConfig(prev => {
                return { ...prev, visiable: false }
            })
        }
    }

    const handleChangeComplete = (color) => {
        var newColor = 'rgba(' + color.rgb.r + ', ' + color.rgb.g + ', ' + color.rgb.b + ', ' + color.rgb.a + ')'
        console.log(newColor);
        updateColor(chartIndex, sketchConfig.editId, newColor)
    }

    const answerBarChart = () => {
        setState({
            labels: chartChoices,
            datasets: [
                {
                    label: chartQuestion.title ? chartQuestion.title : chartQuestion.name,
                    data: chartData,
                    backgroundColor: chartColors
                }
            ],
        })
    }


    return (
        <div className="body_container">
            <table className="board_body">
                <tbody>
                    <div style={{
                        position: 'relative'
                    }}>
                            {
                                chartColors.length &&
                                <Pie data={state}  onElementsClick={onBarClick} />
                            }
                            <div className="" style={{
                                position: 'absolute',
                                display: sketchConfig.visiable ? 'block' : 'none',
                                left: sketchConfig.position.x,
                                top: sketchConfig.position.y,
                            }}>
                                <SketchPicker
                                    color={chartColors[sketchConfig.editId]}
                                    onChangeComplete={handleChangeComplete}
                                />
                            </div>
                        </div>
                </tbody>
            </table>
        </div>)


}


export default PieChartContainer;