import './ForgotPassword.css';
import { PrimaryButton } from "../../elements/button/Button";
import { TextInput } from "../../elements/textInput/TextInput";

export const EmployeeIdComponent = ({ onIdChange, onSubmit }) => {
    return (
        <>
            <div className="title">Enter your employee ID</div>
            <TextInput label="Enter your employee ID" maskInput={false} width="100%" onChange={onIdChange} />
            <PrimaryButton label="Submit" onClick={onSubmit} width="100%" />
        </>
    );
}