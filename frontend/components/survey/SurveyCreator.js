import React, { useState, useEffect, useRef } from "react";
import * as SurveyKo from "survey-knockout";
import * as SurveyJSCreator from "survey-creator";
import "survey-react/survey.css";
import "survey-creator/survey-creator.css";

import "jquery-ui/themes/base/all.css";
import "nouislider/distribute/nouislider.css";
import "select2/dist/css/select2.css";
import "bootstrap-slider/dist/css/bootstrap-slider.css";

import "jquery-bar-rating/dist/themes/css-stars.css";
import "jquery-bar-rating/dist/themes/fontawesome-stars.css";

import $ from "jquery";
import "jquery-ui/ui/widgets/datepicker.js";
import "select2/dist/js/select2.js";
import "jquery-bar-rating";

//import "icheck/skins/square/blue.css";
import "pretty-checkbox/dist/pretty-checkbox.css";

import * as widgets from "surveyjs-widgets";

import { useRouter } from 'next/router';

import cookie from 'js-cookie';

import { json } from "./survey_json";
import { config } from "../../config/initialConfig"

export default function SurveyCreator({
    surveyId,
    eventId,
    associationId,
    question,
    handleClose,
    trigger,
}) {

    let surveyCreator;
    const componentRef = useRef(null);
    const router = useRouter();

    // add dependencies at frontend only 
    useEffect(() => {
        // jquery
        SurveyJSCreator.StylesManager.applyTheme("default");
        window["$"] = window["jQuery"] = $;
        //widgets.icheck(SurveyKo, $);
        widgets.prettycheckbox(SurveyKo);
        widgets.select2(SurveyKo, $);
        widgets.inputmask(SurveyKo);
        widgets.jquerybarrating(SurveyKo, $);
        widgets.jqueryuidatepicker(SurveyKo, $);
        widgets.nouislider(SurveyKo);
        widgets.select2tagbox(SurveyKo, $);
        //widgets.signaturepad(SurveyKo);
        widgets.sortablejs(SurveyKo);
        widgets.ckeditor(SurveyKo);
        widgets.autocomplete(SurveyKo, $);
        widgets.bootstrapslider(SurveyKo);
    }, [])

    // load survey question and create creator
    useEffect(async () => {
        let options = {
            showEmbededSurveyTab: false,
            showLogicTab: false,
            showCustomTab: false,
            questionTypes: ["text", "dropdown", "checkbox", "radiogroup", "rating","nouislider","imagepicker", "sortedlist", "boolean"]
        };
        surveyCreator = new SurveyJSCreator.SurveyCreator(
            null,
            options
        );
        surveyCreator.saveSurveyFunc =
            (surveyId === null)
                ? saveMySurvey
                : updateMySurvey;

        surveyCreator.onUploadFile.add(async (creator, options) => {
            var formData = new FormData();
            options.files.forEach(function (file) {
                formData.append("file", file);
            });

            const token = cookie.get('jwt-token')
            var imageURL = await fetch(`${config.SERVER_BASE}/api/upload_image`, {
                method: "POST",
                headers: {
                    "x-access-token": token,
                },
                body: formData,
            }).then(data => data.json());
            options.callback("success", `${config.SERVER_BASE}/img/${imageURL.image}`);
        })

        surveyCreator.tabs().push({
            name: "survey-templates",
            title: "My Custom Tab",
            template: "custom-tab-survey-templates",
            action: () => {
                surveyCreator.makeNewViewActive("survey-templates");
            },
            data: {},
        });
        surveyCreator.render("surveyCreatorContainer");
        surveyCreator.text = (surveyId === null)
            ? JSON.stringify({})
            : question;
        componentRef.current.querySelector('.svd_commercial_container').style.visibility = "hidden";
    }, []);

    const saveMySurvey = async () => {
        // console.log(JSON.stringify(surveyCreator.text))
        var question = JSON.parse(surveyCreator.text);

        const res = await fetch(`${config.SERVER_BASE}/api/survey`, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                "eventId": eventId,
                "associationId": associationId,
                "questionJson": surveyCreator.text,
                "title": ('title' in question) ?  question.title : ""
            })
        })
        if (res.status === 201) {
            const { surveyId } = await res.json();
            alert("successful");
            window.open(`/survey/${surveyId}`, '_blank').focus();
            trigger();
            handleClose();
        }
    };

    const updateMySurvey = async () => {
        // console.log(JSON.stringify(surveyCreator.text))
        var question = JSON.parse(surveyCreator.text);
        const res = await fetch(`${config.SERVER_BASE}/api/survey`, {
            method: "PUT",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                'surveyId': surveyId,
                "eventId": eventId,
                "associationId": associationId,
                'questionJson': surveyCreator.text,
                "title": ('title' in question) ?  question.title : ""
            })
        })
        if (res.status === 200) {
            alert("Updated");
            trigger();
            handleClose();
        }
    }

    return (<div>
        <script type="text/html" id="custom-tab-survey-templates">
            {`<div id="test">TEST</div>`}
        </script>

        <div id="surveyCreatorContainer" ref={componentRef} />
    </div>);

}



