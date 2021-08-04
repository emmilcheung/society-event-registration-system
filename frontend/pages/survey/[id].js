import React, { useState, useEffect } from "react";

export { MyQuestion } from "../../components/survey/MyQuestion";

import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { json } from "../../components/survey/survey_json";
import { config } from "../../config/initialConfig";
import Loading from '../../components/Loading';

//widgets.icheck(Survey, $);

const DynamicSurveyPage = ({ surveyId, question, trigger }) => {
    const SurveyPage = React.useMemo(() => dynamic(
        () => import('../../components/survey/SurveyPage'),
        { loading: () => <Loading />, ssr: false }
    ), [])
    return <SurveyPage surveyId={surveyId} question={question} trigger={trigger} />
}

export default function Survey({ data }) {

    const [question, setQuestion] = useState(data.questionJson);
    const router = useRouter();
    // useEffect(() => {
    //     console.log(router.query);
    //     if(Object.keys(router.query).length) loadSurvey();
    // }, [router.query])



    return (
        <>
            <div className="container">
                <DynamicSurveyPage
                    surveyId={router.query.id}
                    question={question}
                    trigger={[]}
                />
            </div>
        </>
    );
}

const loadSurvey = async () => {
    const res = await fetch(`${config.SERVER_BASE}/api/survey/${router.query.id}`);
    const data = await res.json();
    console.log(data);
    setQuestion(data.questionJson);
}

export const getServerSideProps = async (context) => {

    const res = await fetch(`${config.SERVER_BASE}/api/survey/${context.params.id}`);

    if (res.status === 401 || res.status === 403 || res.status === 500) {
        return {
            props: {
                data: json
            }
        }
    }
    const data = await res.json();
    return {
        props: {
            data: data
        }
    }
}