import { useEffect, useRef, useState } from "react";
import { config } from '../../config/initialConfig'
import { Bar, Doughnut, Pie } from "react-chartjs-2"
import { Button } from '@material-ui/core';
import { exportHTML } from './ExportReport';

var months = ["Janary", "Febrary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Statistic = ({ dataArray, title }) => {
    function getRandomColor() {
        var num = Math.round(0xffffff * Math.random());
        var r = num >> 16;
        var g = num >> 8 & 255;
        var b = num & 255;
        return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';
    }
    const today = new Date();
    const colleges = [], majors = [], attendances = [], members = [];
    const collegeCount = {}, majorCount = {}, attendanceCount = {}, memberCount = {};
    const [collegeData, setCollegeData] = useState({});
    const [majorData, setMajorData] = useState({});
    const [attendanceData, setAttendanceData] = useState({});
    const [memberData, setMemberData] = useState({});
    const collegeColor = [], majorColor = [], attendanceColor = [], memberColor = [];
    const options = {
        responsive: true,
        plugins: {
            datalabels: {
                display: true,
                color: 'white'
            }
        }
    }

    var barOptions = {
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

    const collegeDoughnut = () => {
        colleges.forEach(c => {
            collegeCount[c] = (collegeCount[c] || 0) + 1;
        })
        Object.keys(collegeCount).forEach(_ => {
            collegeColor.push(getRandomColor());
        })
        setCollegeData({
            labels: Object.keys(collegeCount),
            datasets: [
                {
                    label: 'College',
                    data: Object.values(collegeCount),
                    backgroundColor: collegeColor
                }
            ]
        });
    }

    const majorDoughnut = () => {
        majors.forEach(c => {
            majorCount[c] = (majorCount[c] || 0) + 1;
        })
        Object.keys(majorCount).forEach(_ => {
            majorColor.push(getRandomColor());
        })
        setMajorData({
            labels: Object.keys(majorCount),
            datasets: [
                {
                    label: 'Major',
                    data: Object.values(majorCount),
                    backgroundColor: majorColor
                }
            ]
        });
    }
    const attendanceDoughnut = () => {
        attendances.forEach(checkIn => {
            (checkIn && checkIn != null)
                ? attendanceCount['Attended'] = (attendanceCount['Attended'] || 0) + 1
                : attendanceCount['Absent'] = (attendanceCount['Absent'] || 0) + 1
        })
        Object.keys(attendanceCount).forEach(_ => {
            attendanceColor.push(getRandomColor());
        })
        setAttendanceData({
            labels: Object.keys(attendanceCount),
            datasets: [
                {
                    label: 'Attendance',
                    data: Object.values(attendanceCount),
                    backgroundColor: attendanceColor
                }
            ]
        });
    }

    const memberDoughnut = () => {
        members.forEach(role => {
            (role == "member")
                ? memberCount['Member'] = (memberCount['Member'] || 0) + 1
                : memberCount['Guest'] = (memberCount['Guest'] || 0) + 1
        })
        Object.keys(memberCount).forEach(_ => {
            memberColor.push(getRandomColor());
        })
        setMemberData({
            labels: Object.keys(memberCount),
            datasets: [
                {
                    label: 'Attendance',
                    data: Object.values(memberCount),
                    backgroundColor: memberColor
                }
            ]
        });
    }

    useEffect(() => {
        if (dataArray) {
            dataArray.forEach(data => {
                colleges.push(data.college);
                majors.push(data.major);
                attendances.push(data.check_in)
                members.push(data.role)
            })
            collegeDoughnut();
            majorDoughnut();
            attendanceDoughnut();
            memberDoughnut();
        }
    }, [dataArray])

    const reportStates = [
        {
            type: 'doughnut',
            data: collegeData
        },
        {
            type: 'bar',
            data: majorData
        },
        {
            type: 'pie',
            data: attendanceData
        },
        {
            type: 'doughnut',
            data: memberData
        }
    ];

    return (
        <>
            <Button
                onClick={() => exportHTML(reportStates, title)}
            >
                HTML
      </Button>
            <div className="container" style={{ width: "100%" }}>
                <div style={{
                    marginTop: "30px",
                    display: "grid",
                    gridGap: "10px",
                    gridTemplateColumns: "repeat(auto-fill, 600px)",
                    // flexWrap: "wrap",
                    justifyContent: "space-around"
                }}>
                    <div style={{ width: "min(600px,100%)", height: "auto" }}>
                        <h4>College</h4>
                        <Doughnut data={collegeData} options={options} style={{ width: "400px", height: "400px" }} />
                    </div>
                    <div style={{ width: "min(600px,100%)", height: "auto" }}>
                        <h4>Major</h4>
                        <Bar data={majorData} option={barOptions} style={{ width: "400px", height: "400px" }} />
                    </div>
                    <div style={{ width: "min(600px,100%)", height: "auto" }}>
                        <h4>Attendance Percentage</h4>
                        <Pie data={attendanceData} options={options} style={{ width: "400px", height: "400px" }} />
                    </div>
                    <div style={{ width: "min(600px,100%)", height: "auto" }}>
                        <h4>Major</h4>
                        <Doughnut data={memberData} options={options} style={{ width: "400px", height: "400px" }} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Statistic;