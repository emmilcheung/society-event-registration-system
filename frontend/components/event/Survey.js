import React, { useState, useEffect } from "react";
import cookie from 'js-cookie';


import { Button } from '@material-ui/core';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive'
import { config } from '../../config/initialConfig';

import Loading from '../Loading';
import SurveyCreatorModal from "../modals/SurveyCreatorModal";
import SurveyAnswerModal from "../modals/SurveyAnswerModal";
import { json } from "../survey/survey_json";

import dynamic from 'next/dynamic'
const DynamicSurveyPage = ({ surveyId, question, data }) => {
    const SurveyPage = React.useMemo(() => dynamic(
        () => import('../../components/survey/SurveyAnswer'),
        { loading: () => <Loading />, ssr: false }
    ), [])
    return <SurveyPage surveyId={surveyId} question={question} data={data} />
}

const answer = {}

const Survey = ({
    event
}) => {
    //modals
    const [creatorOpen, setCreatorOpen] = useState(false);
    const [viewAnswerOpen, setViewAnswerOpen] = useState(false);
    const [surveyIds, setSurveyIds] = useState([]);
    const [surveyTitles, setSurveyTitles] = useState([]);
    const [question, setQuestion] = useState({});
    const [answers, setAnswers] = useState([]);
    const [state, setState] = useState(false);
    const [currentId, setCurrentId] = useState('');

    const haveSurvey = (surveyIds.length > 0) ? true : false;

    useEffect(() => {
        loadSurveyMeta();
    }, [state])
    const trigger = () => { setState(prevState => !prevState) }

    const loadSurveyMeta = async () => {
        const idObjArray = await loadSurveyMetas();
        // console.log(idObjArray);
        setSurveyIds(idObjArray.map(obj => obj.id));
        setSurveyTitles(idObjArray.map(obj => obj.title));
        // if (idObjArray.length > 0) {
        //     // load question
        //     // loadSurveyQuestion(0);
        //     // load answers
        // }
    }


    const loadSurveyMetas = async () => {
        const res = await fetch(`${config.SERVER_BASE}/api/survey_list/${event.event_id}`);
        return await res.json();
    }

    const loadSurveyQuestion = async (index) => {
        const res = await fetch(`${config.SERVER_BASE}/api/survey/${surveyIds[index]}`);
        const data = await res.json();
        setQuestion(data.questionJson);
    }

    const loadSurveyAnswer = async (index) => {
        const jwtToken = cookie.get('jwt-token');
        const res2 = await fetch(`${config.SERVER_BASE}/api/survey_answers/${surveyIds[index]}`, {
            headers: {
                'x-access-token': jwtToken,
            }
        });
        const data2 = await res2.json();
        console.log(data2)
        setAnswers(data2);
    }

    const sendSurveyNotification = async (index) => {
        // console.log(surveyIds[index], surveyTitles);
        const jwtToken = cookie.get('jwt-token');
        const res = await fetch(`${config.SERVER_BASE}/api/survey_notification`, {
            method: "POST",
            headers: {
                'x-access-token': jwtToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventId: event.event_id,
                associationId: event.association_id,
                surveyId: surveyIds[index],
                surveyTitle: surveyTitles[index],
            })
        });
        if (res.status == 200) {
            alert("sent");
        }
    }

    const copySurveyLink = (index) => {
        const el = document.createElement('textarea');
        el.value = `${window.location.origin}/survey/${surveyIds[index]}`;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        alert("Copied");
    }

    // const questionObj = JSON.parse(question);
    const openAnswer = async (index) => {
        setCurrentId(surveyIds[index]);
        await loadSurveyQuestion(index);
        await loadSurveyAnswer(index);
        setViewAnswerOpen(true);
    }

    const openCreator = async (index) => {
        setCurrentId(surveyIds[index]);
        await loadSurveyQuestion(index);
        setCreatorOpen(true);
    }

    return (
        <div className="participant_container">
            <div className="survey_header">
                <Button
                    color={"primary"}
                    onClick={() => {
                        setCurrentId(null)
                        setQuestion({});
                        setCreatorOpen(true);
                    }}
                >Create Survey</Button>
            </div>
            {/* <table style={{ width: '100%' }}>
                <tr>
                    <th>Survey Title</th>
                    <th>Answer no.</th>
                    <th>Last modified</th>
                    <th></th>
                </tr>
                {
                    surveyIds.map((_, i) => {
                        return (
                            <tr key={i} className="survey_item">
                                <td className="survey_title">
                                    {questionObj['title']}
                                </td>
                                <td className="answer_count">
                                    {answers.length}
                                </td>
                                <td></td>
                                <td>
                                    ...
                                </td>
                            </tr>
                        )
                    })
                }
            </table> */}
            {
                surveyIds.map((surveyId, index) => {
                    return (
                        <div style={{
                            margin: "30px 0",
                            border: "1px solid #ccc",
                            borderRadius: "16px",
                            padding: "16px "
                        }}>
                            <div className="survey_header" style={{ marginBottom: "10px"}}>
                                <h2>{`Survey[${index + 1}] - ${surveyTitles[index]}`}</h2>
                            </div>
                            <Button
                                variant="outlined"
                                onClick={() => openCreator(index)}
                            > Edit Survey
                        </Button>
                            <Button
                                variant="outlined"
                                onClick={() => openAnswer(index)}
                            > View Answer
                        </Button>
                            <Button
                                variant="outlined"
                                onClick={() => sendSurveyNotification(index)}
                            > <NotificationsActiveIcon />
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => copySurveyLink(index)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
                            </Button>
                        </div>)
                })
            }
            {/* {
                !haveSurvey &&
                <Button
                    variant="outlined"
                    onClick={() => setCreatorOpen(true)}
                >Create Survey
                        </Button>
            } */}
            {/* <h2>Question Preview</h2>
            {
                (haveSurvey) &&
                <DynamicSurveyPage
                    surveyId={surveyIds[0]}
                    question={question}
                    data={answer}
                />
            } */}
            <div className="survey_meta">

            </div>

            <SurveyCreatorModal
                open={creatorOpen}
                setOpen={setCreatorOpen}
                eventId={event.event_id}
                associationId={event.association_id}
                question={question}
                surveyId={currentId}
                trigger={trigger}
            />
            <SurveyAnswerModal
                open={viewAnswerOpen}
                setOpen={setViewAnswerOpen}
                question={question}
                surveyId={currentId}
                answers={answers}
            />

        </div>
    );
}

export default Survey;