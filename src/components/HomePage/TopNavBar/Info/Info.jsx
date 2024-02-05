import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as InfoIcon } from '../../../../resources/top nav bar/info.svg';
import './Info.css'; // Import your CSS file for styling

// Define the Info component
export const Info = ({handleInfoClick}) => {

  // Render the Info component
  return (
    <div className="info clickable" onClick={handleInfoClick}>
      <InfoIcon />
    </div>
  );
};