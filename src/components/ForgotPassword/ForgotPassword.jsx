import { useState } from "react";
import { EmployeeIdComponent } from "./EmployeeIdComponent";
import { OtpComponent } from "./OtpComponent";
import { ResetPasswordComponent } from "./ResetPasswordComponent";
import './ForgotPassword.css';

export const ForgotPassword = () => {

    const [screen, setScreen] = useState('employeeId');

    const [employeeId, setEmployeeId] = useState();
    const [mobileNumber, setMobileNumber] = useState();
    const [otp, setOtp] = useState();
    const [newPassword, setNewPassword] = useState();
    
    const submitEmployeeId = () => {
        // fetch('/getEmployeeDetails')
        //     .then(resp => resp.json())
        //     .then(data => {
        //         setMobileNumber(data.mobileNumber)
        //         setScreen('otp')
        //     })
        //     .catch(() => {})

        // fetch('/sendOtp')
        setMobileNumber('data.mobileNumber')
        setScreen('otp')
    }

    const submitOtp = () => {
        // fetch('')
        //     .then(resp => resp.json())
        //     .then(data => {
        //         setMobileNumber(data.mobileNumber)
        //         setScreen('otp')
        //     })
        //     .catch(() => {})
        setScreen('resetPassword')
    }

    const updatePassword = () => {
        // fetch('/updatePassword')
        console.log('password updated successfully')
    }

    return (
        <div className="background">
            <div className="frame">
                { screen === 'employeeId' && <EmployeeIdComponent onIdChange={setEmployeeId} onSubmit={submitEmployeeId} /> }
                { screen === 'otp' && <OtpComponent mobileNumber={mobileNumber} onOtpChange={setOtp} onSubmit={submitOtp} /> }
                { screen === 'resetPassword' && <ResetPasswordComponent onPasswordChange={setNewPassword} onSubmit={updatePassword} /> }
            </div>
        </div>
    );
}