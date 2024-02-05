import { useEffect, useState } from "react";
import { fetchData } from "../../../../api/fetchData";
import { Drawer } from "@mui/material";
import {ReactComponent as SettingsIcon} from '../../../../resources/top nav bar/settings.svg'
import { SettingSection } from '../../SettingSection/SettingSection'
import './Settings.css'

export const Settings = ({showUpdateAlert, showErrorAlert}) => {
    const [showSettingSection, setShowSettingSection] = useState(false);
    const [settingsData, setSettingsData] = useState({});
    const [settingsLoading, setSettingsLoading] = useState(false);
    
    const updateSettingsData = () => {
        const onSettingsData = (data) => {
            console.log('setting data:', data)
            setSettingsData(data)
            sessionStorage.setItem('timeFormat', data.hours_format)
        }
        
        fetchData(process.env.REACT_APP_SETTINGS, setSettingsLoading, onSettingsData, ()=>showErrorAlert('Failed to get settings'))
    }
    
    const onSettingsSaved = () => {
        setShowSettingSection(false)
        showUpdateAlert()
        updateSettingsData()
    }

    useEffect(updateSettingsData, [])

    return (
        <>
            {settingsLoading?
                <></>
                :
                <>
                    <div className="settings clickable" onClick={()=>setShowSettingSection((showSetting) => !showSetting)}>
                        <SettingsIcon />
                    </div>
                    <Drawer
                        anchor="right"
                        open={showSettingSection}
                        onClose={()=>setShowSettingSection(false)}
                    >
                        <SettingSection 
                        data={settingsData} 
                        onClose={()=>setShowSettingSection(false)} 
                        onSave={onSettingsSaved} 
                        onSaveFailed={()=>showErrorAlert('Settings update failed')} 
                        />
                    </Drawer>
                </>
            }
        </>
    )
}