import React, { useState, useEffect } from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";

import * as widgets from "surveyjs-widgets";
import "jquery-ui/themes/base/all.css";
import "nouislider/distribute/nouislider.css";
import "select2/dist/css/select2.css";
import "bootstrap-slider/dist/css/bootstrap-slider.css";

import "jquery-bar-rating/dist/themes/css-stars.css";

import $ from "jquery";
import "jquery-ui/ui/widgets/datepicker.js";
import "select2/dist/js/select2.js";
import "jquery-bar-rating";

import "pretty-checkbox/dist/pretty-checkbox.css";

import { json } from "./survey_json";
import { config } from "../../config/initialConfig"

import "icheck/skins/square/blue.css";
// window["$"] = window["jQuery"] = $;
// require("icheck");


export default function SurveyPage({ surveyId, question }) {

    const [model, setModel] = useState(null);

    // force loading jquery in frontend
    useEffect(() => {
        Survey.StylesManager.applyTheme("default");
        window["$"] = window["jQuery"] = $;
        //widgets.icheck(Survey, $);
        widgets.prettycheckbox(Survey);
        widgets.select2(Survey, $);
        widgets.inputmask(Survey);
        widgets.jquerybarrating(Survey, $);
        widgets.jqueryuidatepicker(Survey, $);
        widgets.nouislider(Survey);
        widgets.select2tagbox(Survey, $);
        //widgets.signaturepad(Survey);
        widgets.sortablejs(Survey);
        widgets.ckeditor(Survey);
        widgets.autocomplete(Survey, $);
        widgets.bootstrapslider(Survey);
    }, [])

    useEffect(async () => {
        setModel(new Survey.Model(question));
    }, [question])

    function onValueChanged(result) {
        console.log("value changed!");
    }

    function onComplete(result) {
        console.log("Complete! " + result);
        console.log(JSON.stringify(result.data));
        postAnswer(result.data);
    }

    async function postAnswer(data) {
        const res = await fetch(`${config.SERVER_BASE}/api/survey_answer`, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                "surveyId": surveyId,
                "answerJson": data
            })
        })
        return res.json();
    }

    return (
        <>
            {
                model &&
                <Survey.Survey
                    model={model}
                    onComplete={onComplete}
                    onValueChanged={onValueChanged}
                    showProgressBar = {'bottom'}
                    loadSurvey={"Please wait. Your survey is loading…"}
                />
            }
        </>
    );
}