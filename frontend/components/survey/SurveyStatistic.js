import React, { useState, useEffect } from 'react';

import { Button } from '@material-ui/core';

import { exportHTML } from './ExportReport';
import SingleChoice from './question_type/SingleChoice';
import SortableList from './question_type/SortableList';

const SurveyStatistic = ({ question, answers }) => {

    // var declare
    const questionObj = JSON.parse(question);
    const surveyTitle = questionObj.title;
    const [reportStates, setReportStates] = useState([]);
    const [model, setModel] = useState(null);
    // initialize the data and report setting
    useEffect(() => {
        var temp = [];
        // functional const
        extractQuestionsToArray().map((question, index) => {
            var choices = choiceStandardlize(question.choices);
            var answersByQuestion = extractAnswerByQuestionName(question.name);
            var standardlized = dataStandardlize(question, answersByQuestion);
            var values = Object.values(standardlized);
            choices = choices.length ? choices : Object.keys(standardlized);
            var colors = []
            choices.forEach(_ => {
                colors.push(getRandomColor());
            })

            temp.push({
                chartMode: 'vertical',
                choices: choices,
                colors: colors,
                question: question,
                standardlizedData: values,
            })
        })
        setReportStates(temp);
    }, [])

    const updateChartMode = (index, type) => {
        var newReportState = { ...reportStates[index] };
        newReportState.chartMode = type;
        updateReportStatesItem(index, newReportState);
    }

    const updateColor = (index, colorIndex, rgba) => {
        var newReportState = { ...reportStates[index] };
        console.log(index, colorIndex, rgba);
        newReportState.colors[colorIndex] = rgba;
        updateReportStatesItem(index, newReportState);
    }

    // func declare
    const updateReportStatesItem = (index, newReportStateItem) => {
        setReportStates(prevStates => {
            var newReportStates = [...prevStates];
            newReportStates[index] = newReportStateItem;
            return newReportStates;
        })
    }

    // extract questions in different page and return a single question array
    const extractQuestionsToArray = () => {
        var returnArray = [];
        var pages = questionObj.pages;
        if (pages && pages.length) {
            pages.forEach(page => {
                if(page.elements){
                    returnArray = returnArray.concat(page.elements);
                }
            })
        }
        console.log(returnArray);
        return returnArray;
    }

    const extractAnswerByQuestionName = (questionName) => {
        return answers.map(answer => answer[questionName])
            .filter(answer => answer != null);
    }

    const dataStandardlize = (question, answers) => {
        // choices value : text pair
        var pairs = {}
        var standardlized = {};
        var choices = question.choices ? question.choices : [];
        choices.forEach(choice => {
            if (choice.value) {
                pairs[choice.value] = choice.text;
            } else {
                pairs[choice] = choice;
            }
        })
        var standardlized;
        // if answer is an array, take the order of the array as preference and store it with the index as key
        if (question.type == "sortablelist") {
            standardlized = choices.map(a => choices.map(_ => 0));
            answers.forEach(answer => {
                // [[0,0,0...], [0,0,0,...]] size of choices * 
                answer.forEach((a, i) => {
                    standardlized[i][choices.indexOf(a)] += 1;
                })
            })
        }
        else {
            // console.log(pairs);
            Object.values(pairs).forEach(key => {
                standardlized[key] = 0;
            })
            answers.forEach(answer => {
                if (pairs[answer] in standardlized) {
                    standardlized[pairs[answer]] += 1;
                }
                else {
                    if (answer in standardlized) {
                        standardlized[answer] += 1;
                    } else {
                        standardlized[answer] = 1;
                    }
                }
            })
        }
        console.log(standardlized);
        return standardlized;
    }

    const choiceStandardlize = (choices) => {
        return choices
            ? choices.map(choice => {
                if (choice.text) {
                    return choice.text;
                } else {
                    return choice;
                }
            }) : []
    }

    const exportCSV = (question, answers) => {
        // var modal = new Survey.Model(question);
        // modal.data = answers;
        const items = answers;
        const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
        const extracted = extractQuestionsToArray();
        const header = Object.keys(items[0])
        const title = Object.keys(items[0]).map(key => extracted.filter(q => q.name == key)[0].title);
        const csv = [
            title.join(','), // header row first
            ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n')
        const blob = new Blob(["\ufeff", csv], { type: 'text/csv' })
        const a = document.createElement('a');
        a.setAttribute('hidden', '')
        a.setAttribute('href', window.URL.createObjectURL(blob))
        a.setAttribute('download', 'survey.csv')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <div className="report">
            <div className="survey_title">
                <h2>{surveyTitle}</h2>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <Button
                    type="outline"
                    onClick={() => exportHTML(reportStates, surveyTitle)}
                >
                    export html
            </Button>
                <Button
                    type="outline"
                    onClick={() => exportCSV(questionObj, answers)}
                >
                    export csv
            </Button>
                {
                    reportStates.map((reportState, i) => {
                        return (<StatisticQuestionItem
                            index={i}
                            question={reportState.question}
                            answers={extractAnswerByQuestionName(reportState.question.name)}
                            reportState={reportStates[i]}
                            updateChartMode={updateChartMode}
                            updateColor={updateColor}
                        />)
                    })
                }
            </div>
        </div>
    );
}

const StatisticQuestionItem = (props) => {
    const renderSwitch = () => {
        switch (props.question.type) {
            case "sortablelist":
                return (<SortableList {...props} />);
            default: return (<SingleChoice {...props} />)
        }
    }
    return renderSwitch();
}


function getRandomColor() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';
}


const arrayToString = (array) => {
    return `['${array.join("','")}']`;
}

const constructExportCSV = (question, answers) => {
    // var dataStrings = `${questions.map(q => q.title).join(',')}\n`
    // dataStrings += answers.map(answer => ``)
    //     .join("\n")
    // console.log(dataStrings);
    //     return dataStrings
}



export default SurveyStatistic;