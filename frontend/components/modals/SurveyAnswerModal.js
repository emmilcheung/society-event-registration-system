import React, { useState } from 'react';
import { Modal } from '@material-ui/core';
import { Button } from '@material-ui/core';

import Loading from '../Loading';
import SurveyStatistic from '../survey/SurveyStatistic';
import AnswerView from '../survey/AnswerPreview';



export default function SurveyAnswerModal({
  open,
  setOpen,
  question,
  surveyId,
  answers,
}) {

  const [mode, setMode] = useState('preview');

  const handleClose = () => {
    setOpen(false);
  };

  const body = (<div
    style={{
      position: 'relative',
      color: "var(--card-text)",
      backgroundColor: "var(--card-bg)",
      borderRadius: "max(0px, min(8px, ((100vw - 4px) - 100%) * 9999)) / 8px",
      boxShadow: "var(--shadow-card)",
      width: "min(1800px, 95vw)",
      minHeight: "95vh",
      maxHeight: "95vh",
      overflowX: "hidden",
      overflowY: "scroll",
      top: `50%`,
      left: `50%`,
      transform: `translate(-50%, -50%)`,
      padding: "20px 40px",
    }}>
    <div className="table_container">
      <Button
        onClick={() => setMode('preview')}
      >
        Preview
      </Button>
      <Button
        onClick={() => setMode('statistic')}
      >
        Statistic
      </Button>
      <div style={{
        display: mode == 'preview' ? 'block' : 'none',
      }}>
        <AnswerView
          surveyId={surveyId}
          question={question}
          answers={answers}
        />
      </div>
      <div style={{
        display: mode == 'statistic' ? 'block' : 'none',
      }}>
        <SurveyStatistic
          question={question}
          answers={answers}
        />
      </div>
    </div>
  </div>
  );

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}