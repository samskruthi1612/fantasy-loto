import "./SettingSection.css";
import { useLocation } from "react-router-dom";
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { ReactComponent as CloseButton } from "../../../resources/close-button.svg";
import { PrimaryButton } from "../../../elements/button/Button";
import TextInputv2 from "../../../elements/textInputv2/TextInputv2";
import SectionItem from "../../../elements/sectionItem/SectionItem";
import Toggle from "react-toggle";
import { useState, useEffect } from "react";

export const SettingSection = ({ data, onClose, onSave, onSaveFailed }) => {

  const [newData, setNewData] = useState(data);
  const [loading, setLoading] = useState(false)


  // console.log('input data:', data)
  const validateAndSave = () => {
    let invalid = false
    if(invalid)
      return
    postNewSettings()
  };

  const postNewSettings = () => {
    setLoading(true)
    fetch(process.env.REACT_APP_SETTINGS, {
      method: 'PUT',
      headers: {
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(newData)
    })
    .then(resp=>{
      setLoading(false)
      if(resp.status == 200) {
        onSave()
      } else {
        console.log('Settings update failed with status ', resp.status)
        onSaveFailed()
      }
    })
    .catch(err => {
      setLoading(false)
      console.log('error while updating settings', err)
      onSaveFailed()
    })
  }

  return (
    <>
      {loading && <CenterFantasyLoader />}
      <div className="editBatchDrawer">
        <div className="drawerTitleRows">
          <div className="drawerTitleText">Settings</div>
          <div className="closeButton clickable" onClick={onClose}>
            <CloseButton />
          </div>
        </div>
        <SectionItem label="Site Settings">
          <TextInputv2
            label="Site name"
            width="100%"
            defaultValue={data.name}
            disabled={true}
          />
          <TextInputv2
            label="Site URL"
            width="100%"
            defaultValue={data.url}
            disabled={true}
          />
          <TextInputv2
            label="Support email"
            width="100%"
            // defaultValue={data.email}
            defaultValue={data.email}
            onChange={(val)=>{setNewData(curData => ({...curData,email:val}))}}
            disabled={false}
          />
          <TextInputv2
            label="Support number"
            width="100%"
            defaultValue={data.phone}
            disabled={false}
            onChange={(val)=>{setNewData(curData => ({...curData,phone:val}))}}
          />
        </SectionItem>
        <SectionItem label="Date and Time">
          <TextInputv2
            label="Time Zone"
            width="100%"
            defaultValue={data.timezone}
            disabled={true}
          />
          <div className="TimeFormat">
            <div className="TimeFormatContent">
              <div className="DisplayTime">Display in 24-hours format ?</div>
              <div className="TimeValue">{newData.hours_format==='12'?'5:00PM':'17:00'}</div>
            </div>
            <div className="TimeFormatToggle">
              <label>
                <Toggle
                  defaultChecked={newData.hours_format==='24'}
                  icons={false}
                  onChange={(val)=>{setNewData(curData => ({...curData,hours_format:curData.hours_format==='12'?'24':'12'}))}}
                />
              </label>
            </div>
          </div>
        </SectionItem>
        <div className="saveButton">
          <PrimaryButton
            type="primary"
            label="Save"
            style={{ width: "100%" }}
            onClick={validateAndSave}
          />
        </div>
      </div>
    </>
  );
};
