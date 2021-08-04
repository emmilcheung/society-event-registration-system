import { useEffect, useRef, useState } from "react";
import { config } from '../../config/initialConfig'
import { Bar, Doughnut } from "react-chartjs-2"
import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

var months = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Statistic = ({ events }) => {
    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    const today = new Date();
    const categories = [], forms = [];
    const categoryCount = {}, formCount = {};
    const [monthCount, setMonthCount] = useState({});
    const [categoryData, setCategoryData] = useState({});
    const [formData, setFormData] = useState({});
    const [monthData, setMonthData] = useState({});
    const categoryColor = [], formColor = [], monthColor = [];
    const options = {
        cutoutPercentage: 60,
    }
    const [board, setBoard] = useState({
        year: today.getFullYear()
    });
    const categoryDoughnut = () => {
        categories.forEach(c => {
            categoryCount[c] = (categoryCount[c] || 0) + 1;
        })
        console.log(categoryCount);
        Object.keys(categoryCount).forEach(_ => {
            categoryColor.push(getRandomColor());
        })
        setCategoryData({
            labels: Object.keys(categoryCount),
            datasets: [
                {
                    label: 'Categories',
                    data: Object.values(categoryCount),
                    backgroundColor: categoryColor
                }
            ]
        });
    }

    const formDoughnut = () => {
        forms.forEach(f => {
            formCount[f] = (formCount[f] || 0) + 1;
        })
        console.log(formCount);
        Object.keys(formCount).forEach(_ => {
            formColor.push(getRandomColor());
        })
        setFormData({
            labels: Object.keys(formCount),
            datasets: [
                {
                    label: 'Forms',
                    data: Object.values(formCount),
                    backgroundColor: formColor
                }
            ]
        });
    }

    const monthBarChart = (year) => {
        console.log(year);
        console.log(monthCount[year]);
        months.forEach(_ => {
            monthColor.push(getRandomColor());
        })
        setMonthData({
            labels: months,
            datasets: [
                {
                    label: "Participated Events",
                    data: monthCount[year],
                    backgroundColor: monthColor
                }
            ]
        })
    }

    useEffect(() => {
        events.forEach(event => {
            categories.push(config.EVENT_CATEGORY[event.category]);
            forms.push(config.EVENT_FORM[event.form]);
            console.log(categories);
            console.log(forms);
        })
        categoryDoughnut()
        formDoughnut()
    }, [])

    useEffect(() => {
        events = events.map(event => {
            event.start_time = new Date(event.start_time);
            return event
        })
        events.forEach(event => {
            var year = event.start_time.getFullYear();
            var month = event.start_time.getMonth();
            if (!(year in monthCount)) {
                monthCount[year] = [];
                for (let i = 0; i < 12; i++) {
                    monthCount[year][i] = 0;
                }
            }
            monthCount[year][month] += 1;
        })
        if (Object(monthCount.length)) {
            monthBarChart(board.year)
        }
    }, [monthCount])

    const yearAdd = () => {
        setBoard(prev => {
            var year = prev.year + 1;
            return { year: year };
        })
    }

    const yearMinus = () => {
        setBoard(prev => {
            var year = prev.year - 1;
            return { year: year };
        })
    }

    return (
        <>
            <div className="container">
                <h2>Total Participated Events: {events.length}</h2><br />
                <div className="event_board">
                    <div className="board_header">
                        <div className="board_header_left">
                            <h2>{`Engagement in ${board.year}`}</h2>
                        </div>
                        <div className="board_header_center" />
                        <div className="board_header_right">
                            {
                                (board.year > 2020)
                                &&
                                <Button onClick={() => {
                                    yearMinus();
                                    monthBarChart(board.year - 1);
                                }}>
                                    <ArrowBackIosIcon />
                                </Button>
                            }
                            {
                                (board.year < today.getFullYear())
                                &&
                                <Button onClick={() => {
                                    yearAdd();
                                    monthBarChart(board.year + 1);
                                }}>
                                    <ArrowForwardIosIcon />
                                </Button>
                            }
                        </div>
                    </div>
                    <div className="body_container">
                        <table className="board_body">
                            <tbody>
                                <Bar data={monthData} />
                            </tbody>
                        </table>
                    </div>

                </div>
                <div className="row" style={{ marginTop: "30px" }}>
                    <div style={{ width: "50%", float: "left" }}>
                        <h4>Category</h4>
                        <Doughnut data={categoryData} options={options} style={{ width: "400px", height: "400px" }} />
                    </div>
                    <div style={{ width: "50%", float: "right" }}>
                        <h4>Form</h4>
                        <Doughnut data={formData} options={options} style={{ width: "400px", height: "400px" }} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Statistic;