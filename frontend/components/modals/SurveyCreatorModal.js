import React from 'react';
import { Modal } from '@material-ui/core';

import Loading from '../Loading';

import dynamic from 'next/dynamic'
const DynamicSurveyCreator = ({ surveyId, eventId, associationId, question, handleClose, trigger }) => {
  const SurveyCreator = React.useMemo(() => dynamic(
    () => import('../survey/SurveyCreator'),
    { loading: () => <Loading />, ssr: false }
  ), [])
  return (
    <SurveyCreator
      surveyId={surveyId}
      setChoice={null}
      eventId={eventId}
      associationId={associationId}
      question={question}
      handleClose={handleClose}
      trigger={trigger}
    />
  )
}

export default function SurveyCreatorModal({
  open,
  setOpen,
  eventId,
  associationId,
  question,
  surveyId,
  trigger,
}) {
  const handleOpen = () => {
    setOpen(true);
  };

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
      overflowX: "scroll",
      overflowY: "scroll",
      top: `50%`,
      left: `50%`,
      transform: `translate(-50%, -50%)`,
      padding: "20px 40px",
    }}>
    <div className="table_container">
      <DynamicSurveyCreator
        surveyId={surveyId}
        eventId={eventId}
        associationId={associationId}
        question={question}
        handleClose={handleClose}
        trigger={trigger}
      />
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