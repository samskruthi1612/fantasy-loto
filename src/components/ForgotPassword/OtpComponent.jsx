import { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/button/Button";
import { TextInput } from "../../elements/textInput/TextInput";
import './ForgotPassword.css';

export const OtpComponent = ({ mobileNumber, onOtpChange, onSubmit }) => {
    console.log(mobileNumber)
    const [timer, setTimer] = useState(30);
    useEffect(() => {
        setTimeout(()=>setTimer(timer-1), 1000);
    });
    const formatTimer = (timer) => `00:${timer}`
    return (
        <>
            <div className="title">Enter 6 digit verification code that has been sent to your mobile number {mobileNumber}</div>
            <TextInput label="Enter code" maskInput={false} width="100%" onChange={onOtpChange} />
            <div className="timer">{formatTimer(timer)}</div>
            <PrimaryButton label="Submit" onClick={onSubmit} width="100%" />
        </>
    );
}