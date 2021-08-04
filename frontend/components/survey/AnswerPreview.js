import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import Loading from '../Loading';

import dynamic from 'next/dynamic';
const DynamicSurveyPage = ({ surveyId, question, data }) => {
    const SurveyPage = React.useMemo(() => dynamic(
        () => import('../../components/survey/SurveyAnswer'),
        { loading: () => <Loading />, ssr: false }
    ), [])
    return <SurveyPage surveyId={surveyId} question={question} data={data} />
}

const AnswerView = ({ surveyId, question, answers }) => {
    const [pageNum, setPageNum] = useState(1);



    // add page number if it is smaller than last page
    const addPageNum = () => {
        setPageNum(prev => prev < answers.length ? prev + 1 : prev);
    }

    // minus page number if it is larger than first page
    const minusPageNum = () => {
        setPageNum(prev => prev > 1 ? prev - 1 : prev);
    }
    return (
        <>
            <div className="answer_page" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <ArrowBackIosIcon
                    onClick={minusPageNum}
                    style={{ cursor: "pointer" }}
                />
                <span style={{
                    display: 'inline-block',
                    width: '40px'
                }}>
                    <TextField
                        id="outlined-basic"
                        variant="outlined"
                        size="small"
                        fullWidth={true}
                        value={pageNum}
                        type="tel"
                    />
                </span>
                <span style={{
                    display: 'inline-block',
                    marginLeft: '10px',
                    fontSize: '1.35em',
                    textAlign: 'center',
                }}
                > / {answers.length} </span>
                <ArrowForwardIosIcon
                    onClick={addPageNum}
                    style={{ cursor: "pointer" }}
                />
            </div>
            <br />
            <DynamicSurveyPage
                surveyId={surveyId}
                question={question}
                data={answers[pageNum - 1]}
            />
        </>
    );
}

export default AnswerView;