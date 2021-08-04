import { useEffect, useRef, useState } from "react";
import { Bar, HorizontalBar } from "react-chartjs-2"
import { SketchPicker } from 'react-color';

const StackedBar = ({
    direction,
    chartIndex,
    chartQuestion,
    chartData,
    chartColors,
    chartChoices,
    updateColor,
}) => {
    console.log(chartData, chartChoices, chartColors);
    const chartRef = useRef(null);
    const [state, setState] = useState({});
    const [sketchConfig, setSketchConfig] = useState({
        visiable: false,
        position: {
            x: 0,
            y: 0,
        },
        editId: 0,
    })

    //initialize 
    useEffect(() => {
        answerBarChart();
    }, []);

    // force rerender when monthcolor changed
    useEffect(() => {
        setState(prev => {
            return {
                labels: prev.labels,
                datasets: chartData.map((data, index) => {
                    return {
                        label: `#${index + 1}`,
                        data: chartData[index],
                        backgroundColor: chartColors[index],
                    }
                }),
            }
        })
    }, [...chartColors]);

    var options = {
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
    };

    const answerBarChart = () => {
        setState({
            labels: chartChoices,
            datasets: 
                chartData.map((data, index) => {
                    return {
                        label: `#${index + 1}`,
                        data: chartData[index],
                        backgroundColor: chartColors[index],
                    }
                })
        })
    }

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
                    y: barObj._chart.height / 4,
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

    return (
        <div className="body_container">
            {/* <table className="board_body">
                <tbody> */}
            {
                direction == 'vertical' &&
                <div style={{
                    position: 'relative'
                }}>
                    {/* <button
                        onClick={() => {
                            var url = chartRef.current.chartInstance.toBase64Image();
                            fetch(url)
                                .then(res => res.blob())
                                .then((b) => {
                                    window.focus(); 
                                    const item = new ClipboardItem({ "image/png": b }); 
                                    navigator.clipboard.write([item]);
                                })
                        }}
                    >abcd</button> */}
                    {
                        chartColors.length &&
                        <Bar data={state} options={options} onElementsClick={onBarClick} ref={chartRef} />
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
            }
            {/* </tbody>
            </table> */}
        </div>)


}


export default StackedBar;