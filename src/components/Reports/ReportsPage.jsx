import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BackArrow from "../../resources/back_arrow.svg";

import "./ReportsPage.css";

const ReportsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="reportsPage">
      <div className="reportsTitle">Reports</div>
      <div className="reportsList">
        <div
          className="reportListItem"
          onClick={() => navigate("/home/winnumbers", location)}
        >
          <p className="reportListItemText">Win Number Results</p>
          <img src={BackArrow} className="buttonImage" alt="button" />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
