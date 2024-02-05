import { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/button/Button";
import { TextInput } from "../../elements/textInput/TextInput";


export const ResetPasswordComponent = ({ onPasswordChange, onSubmit }) => {

    const [newPassword, setNewPassword] = useState();
    const [confirmNewPassword, setConfirmNewPassword] = useState();

    useEffect(() => {
        newPassword === setNewPassword && onPasswordChange(newPassword);
    }, [newPassword, setNewPassword]);

    return (
        <>
            <div className="title">Setup your new password</div>
            <TextInput label="Enter new password" maskInput={true} width="100%" onChange={setNewPassword} />
            <TextInput label="Confirm new password" maskInput={true} width="100%" onChange={setConfirmNewPassword} />
            <PrimaryButton label="Save" onClick={onSubmit} width="100%" />
        </>
    );
}