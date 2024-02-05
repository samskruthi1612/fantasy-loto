import { ReactComponent as CloseButton } from "../../../resources/close-button.svg";
import React, { useState } from "react";

import "./ExportSection.css";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PrimaryButton } from "../../../elements/button/Button";
import { useLocation } from "react-router-dom";
import { DateTime } from "luxon";

const ExportSection = ({ onClose }) => {
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState("");

  const [startDate, setstartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errorMessage, setErrrorMessage] = useState("");

  const handleExport = () => {
    setErrrorMessage("");
    const selectedLast30 = selectedOption === "last30";
    if (!selectedLast30 && !startDate) {
      setErrrorMessage("Start date must not be empty.");
      return;
    }
    if (!selectedLast30 && !endDate) {
      setErrrorMessage("End date must not be empty.");
      return;
    }
    if (!selectedLast30 && startDate > endDate) {
      setErrrorMessage("End date must be after start date.");
      return;
    }

    console.log('start date:', startDate)
    console.log('start date conversion:',DateTime.fromJSDate(startDate).endOf('day').setZone('America/Nassau').startOf('day').toUnixInteger())
    console.log('end date:', endDate)

    const startTs = selectedLast30? DateTime.now().setZone('America/Nassau').startOf('day').minus({days: 30}).toUnixInteger()
                       : DateTime.fromJSDate(startDate.$d).endOf('day').setZone('America/Nassau').startOf('day').toUnixInteger();
    const endTs = selectedLast30? DateTime.now().setZone('America/Nassau').toUnixInteger()
                       : DateTime.fromJSDate(endDate.$d).endOf('day').setZone('America/Nassau').endOf('day').toUnixInteger();

    fetch(
      process.env.REACT_APP_WIN_NUMBERS_HOST +
        "/exports/games?" +
        `start_time=${startTs}&end_time=${endTs}`,
      {
        method: "POST",
        headers: { 
          "x-username": location.state.userDetails.userName,
          'auth-token': localStorage.getItem('token'),
        },
      }
    )
      .then((resp) => {
        if (resp.status == 200) {
          resp.json().then((data) => {
            window.open(data.file, "_blank", "noreferrer");
          });
        } else if (resp.status == 400) {
          setErrrorMessage('Oops, Couldnt find any records with given inputs. Please check inputs and try again')
        } else if ([500,502,503].includes(resp.status)) {
          setErrrorMessage('Oops, Something went wrong, please try again')
        }
      })
      .catch((error) => {
        setErrrorMessage('Oops, Something went wrong, please try again')
        console.log(error)
      });
  };

  return (
    <div className="exportSectionOverlay">
      <div className="titleRow">
        <div className="exportTitle">Export</div>
        <div className="closeButton" onClick={onClose}>
          <CloseButton />
        </div>
      </div>
      <div className="subheading">Choose the export format</div>
      <FormControl
        value={selectedOption}
        onChange={(event) => setSelectedOption(event.target.value)}
      >
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
        >
          <FormControlLabel
            value="last30"
            control={<Radio color={"primary"} />}
            label={<span className="formLabel">Last 30 days</span>}
          />
          <FormControlLabel
            value="custom"
            control={<Radio color={"primary"} />}
            label={<span className="formLabel">Select custom date range</span>}
          />
        </RadioGroup>
      </FormControl>
      {selectedOption === "custom" && (
        <div className="calendersContainer">
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="us">
            <DatePicker
              label={"Select from date"}
              format="YYYY-MM-DD"
              value={startDate === "" ? null : startDate}
              onChange={setstartDate}
              style={{ width: "100%" }}
            />
            <DatePicker
              label={"Select to date"}
              format="YYYY-MM-DD"
              value={endDate === "" ? null : endDate}
              onChange={setEndDate}
              style={{ width: "100%" }}
            />
          </LocalizationProvider>
        </div>
      )}
      {errorMessage && <span className="error-msg">{errorMessage}</span>}
      <div className="exportButton">
        <PrimaryButton
          label="Export"
          style={{ width: "100%" }}
          type="primary"
          onClick={handleExport}
        />
      </div>
    </div>
  );
};

export default ExportSection;
