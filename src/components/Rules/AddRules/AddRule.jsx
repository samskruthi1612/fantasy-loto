import { TextInput } from "../../../elements/textInput/TextInput";
import { ReactComponent as CloseButton } from "../../../resources/close-button.svg";
import React, { useState } from "react";
import TextInputv2 from "../../../elements/textInputv2/TextInputv2";
import "./AddRule.css";
import { PrimaryButton } from "../../../elements/button/Button";
import { Checkbox } from "@mui/material";
import { useLocation } from "react-router-dom";
import TextArea from "../../../elements/textArea/TextArea";

const AddRule = ({
  onClose,
  reload,
  setReload,
  setShowStatusUpdate,
  franchiseId,
}) => {
  const location = useLocation();

  const [ruleName, setRuleName] = useState("");
  const [desc, setDesc] = useState("");
  const [gameRules, setGameRules] = useState(false);
  const [tAndC, setTandC] = useState(false);

  const [errorName, setErrorName] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [errorDisplay, setErrorDisplay] = useState("");

  const [errorRequest, setErrorRequest] = useState("");

  const handleAddRule = () => {
    setErrorRequest("");
    if (!gameRules && !tAndC) {
      setErrorDisplay("Please select one page to Display on");
      return;
    }
    setErrorDisplay("");
    if (ruleName === "") {
      setErrorName("Please Enter a Rule Name");
      return;
    }
    setErrorName("");
    if (desc === "") {
      setErrorDesc("Please enter a Rule Description");
      // alert("Please enter a state name!")
      return;
    }
    setErrorDesc("");
    console.log("user details: ", location.state.userDetails);

    fetch(process.env.REACT_APP_STATE_CITY_API_HOST + "/franchiseRules", {
      method: "POST",
      headers: { 
        "x-username": location.state.userDetails.userName,
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        franchise_id: franchiseId,
        // franchise_id: 4,
        name: ruleName,
        description: desc,
        screen_display: {
          tc: tAndC,
          game_rules: gameRules,
        },
      }),
    })
      .then((resp) => {
        if (resp.status === 200) {
          setShowStatusUpdate("Rule has been added");
          setReload(!reload);
          setTimeout(() => {
            setShowStatusUpdate("");
          }, 5000);
          onClose();
          setReload(!reload);
        } else {
          resp
            .json()
            .then((data) => {
              console.log(data);
              if (data?.description.includes("Duplicate entry"))
                setErrorRequest("Rule with same name exists already");
              else setErrorRequest("Unable to add Rule");
            })
            .catch((e) => {
              setErrorRequest("Unable to add Rule");
            });
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="AddRuleOverlay">
        <div className="titleRow">
          <div className="addTitle">Add Rule</div>
          <div className="closeButton" onClick={onClose}>
            <CloseButton />
          </div>
        </div>
        <div className="AddRule">
          <div className="inputs">
            <p className="sectionTitle">Display on Screens</p>
            <div className="checkboxSide firstCheck">
              <Checkbox
                checked={gameRules}
                onClick={() => setGameRules(!gameRules)}
              />
              <p className="checkboxDesc">Game Rules</p>
            </div>
            <div className="checkboxSide">
              <Checkbox checked={tAndC} onClick={() => setTandC(!tAndC)} />
              <p className="checkboxDesc">Terms & Conditions</p>
            </div>
            {errorDisplay && <span className="error-msg">{errorDisplay}</span>}
            <p className="sectionTitle">Content</p>
            <TextInputv2
              label="Name of Rule"
              width="100%"
              onChange={setRuleName}
              defaultValue={ruleName}
              errorState={errorName}
            />
            {errorName && <span className="error-msg">{errorName}</span>}
            {/* <textarea placeholder="Please state reason" 
                    onChange={(e)=>setComments(e.target.value)} 
                    style={{width: '352px'}} 
                    className="adminInactiveReason" 
                    /> */}
            <TextArea
              rows={5}
              label="Description of Rule"
              onChange={setDesc}
              defaultValue={desc}
            />
            {errorDesc && <span className="error-msg">{errorDesc}</span>}
          </div>
          {errorRequest && <span className="error-msg">{errorRequest}</span>}
        </div>
        <div className="addRuleButton">
          <PrimaryButton
            label="Save"
            style={{ width: "100%" }}
            type="primary"
            onClick={handleAddRule}
          />
        </div>
      </div>
    </>
  );
};

export default AddRule;
