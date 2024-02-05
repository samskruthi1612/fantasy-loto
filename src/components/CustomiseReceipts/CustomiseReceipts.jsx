import { TextInput } from "../../elements/textInput/TextInput";
import { PrimaryButton } from "../../elements/button/Button";
import './CustomiseReceipts.css';
import defaultImage from '../../resources/fantasy_loto_logo.png';
import receiptQR from '../../resources/customiseReceipts_PreviewQR.png';
import betType from '../../resources/customiseReceipts_PreviewbetType.png';
import ticketDetail from '../../resources/customiseReceipts_PreviewTicketDetails.png';
import gameDetail from '../../resources/customizeReceipts_PreviewGameDetails.png';
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert } from "../../elements/alert/Alert";
import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { ErrorAlert } from "../../elements/alert/ErrorAlert";
import TextInputv2 from "../../elements/textInputv2/TextInputv2";
import TextArea from "../../elements/textArea/TextArea";

export const CustReceipt = () => {

    const location =  useLocation();
    const [header, setHeader] = useState('');
    const [headerInvalidMsg, setHeaderInvalidMsg] = useState('');
    const [lotteryBrandName, setLotteryBrandName] = useState('');
    const [lotteryBrandNameInvalidMsg, setLotteryBrandNameInvalidMsg] = useState('');
    const [address, setAddress] = useState('');
    const [addressInvalidMsg, setAddressInvalidMsg] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneNumberInvalidMsg, setPhoneNumberInvalidMsg] = useState('');
    const [thankYouMessage, setThankyouMessage] = useState('');
    const [thankYouMessageInvalidMsg, setThankyouMessageInvalidMsg] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [termsAndConditionsInvalidMsg, setTermsAndConditionsInvalidMsg] = useState('');
    const [footer, setFooter] = useState('');
    const [footerInvalidMsg, setFooterInvalidMsg] = useState('');
    const [receiptLogo, setReceiptLogo] = useState(defaultImage);
    const [receiptLogoInvalidMsg, setReceiptLogoInvalidMsg] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);

    // const defaultLogoLink = URL.createObjectURL(defaultImage);

    // Create a reference to the hidden file input element
    const hiddenFileInput = useRef(null);

    // Programatically click the hidden file input element
    // when the Button component is clicked
    const handleClick = event => {
        hiddenFileInput.current.click();
    };

    const handleChange = event => {
        const fileUploaded = event.target.files[0];
        if (fileUploaded) {
            const fileType =  event.target.files[0].type;
            let file_size = event.target.files[0].size;
            if (fileType == "image/png" || fileType == "image/jpg" || fileType == "image/jpeg") {
                if (file_size > 5000000) {
                    setReceiptLogoInvalidMsg("Uploaded logo size must less 5MB");
                } else {
                    const reader = new FileReader();
                    reader.onload = () => {
                    const base64Data = reader.result;
                    setReceiptLogo(base64Data);
                    };
                    reader.readAsDataURL(fileUploaded);
                    setReceiptLogoInvalidMsg("");
                    // URL.revokeObjectURL(fileUploaded);
                }
            } else {
                setReceiptLogoInvalidMsg("Uploaded logo type should be PNG or JPG");
            }
        }
    };

    const saveChanges = () => {
        const isValidData = validateData()
        if (isValidData) {
            console.log("valid Data!");
            fetch(process.env.REACT_APP_RECEIPT_URL, {
                method: "POST",
                headers: {
                    'x-username': location.state.userDetails.userName,
                    "auth-token": localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    header: header,
                    lotteryBrandName: lotteryBrandName,
                    address: address,
                    phoneNumber: phoneNumber,
                    thankYouMessage: thankYouMessage,
                    termsAndConditions: termsAndConditions,
                    footer: footer
                })
            }).then(resp => {
                if (resp.status == 200) {
                    showPageAlert("Receipt updated successfully");
                    if (receiptLogo != defaultImage) {
                        saveReceiptLogo();
                    }
                    getReceiptData();
                } else {
                    showPageErrorAlert("Error saving receipt data!");
                }
            })
            .catch(() => {
                console.log("Error occured while updating receipt details!");
                showPageErrorAlert("Error saving receipt data!");
            })
        }
    }

    const getReceiptData = () => {
        setLoadingPage(true);
        fetch(process.env.REACT_APP_RECEIPT_URL, {
            method: "GET",
            headers: {
                'x-username':location.state.userDetails.userName,
                "auth-token": localStorage.getItem("token"),
            }
        }).then(resp => {
            if (resp.status == 200) {
                getReceiptLogo();
                resp.json().then(data => {
                    setHeader(data.header);
                    setLotteryBrandName(data.lotteryBrandName);
                    setAddress(data.address);
                    setPhoneNumber(data.phoneNumber);
                    setThankyouMessage(data.thankYouMessage);
                    setTermsAndConditions(data.termsAndConditions);
                    setFooter(data.footer);
                });
                showPageAlert("User Receipt Data Fetched!");
            } else if (resp.status == 404){
                showPageAlert("No receipt found for user!");
            } else {
                showPageErrorAlert("Error getting receipt data!");
            }
            setLoadingPage(false);
        }).catch(() => {
            console.log("Error fetching receipt data")
            showPageErrorAlert("Error getting receipt data!");
            setLoadingPage(false);
        })
    }

    const saveReceiptLogo = () => {
        setLoadingPage(true);
        fetch(process.env.REACT_APP_IMAGE_URL, {
            method: "POST",
            headers: {
                'x-username': location.state.userDetails.userName,
                'scope': 'logo'
            },
            body: receiptLogo.split(",")[1] // send only base 64 formatted string
        })
        .then(resp => {
            if (resp.status == 200) {
                console.log("images uploaded successfully")
                setLoadingPage(false);
            }
        })
        .catch(() => {
            console.log("Error saving logo!");
            setLoadingPage(false);
        })
    }

    const getReceiptLogo = () => {
        fetch(process.env.REACT_APP_IMAGE_URL, {
            method: "GET",
            headers: {
                'x-username': location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
                'scope': 'logo'
            }
        })
        .then(resp => {
            if (resp.status == 200) {
                resp.json().then(data => {
                    setReceiptLogo("data:image/png;base64, " + data);
                });
            } else {
                console.log("Error getting logo data")
            }
        })
        .catch((err) => {
            console.log("Error getting logo!");
            console.log(err);
        })
    }

    const validateData = () => {
        var flag = false
        if (header !=  null && header.trim().length > 0) {
            setHeaderInvalidMsg("");
            flag = true;
        } else {
            setHeaderInvalidMsg("Header cannot be empty value");
            flag = false;
        }
        if (lotteryBrandName != null && lotteryBrandName.trim().length > 0) {
            setLotteryBrandNameInvalidMsg("");
            flag = true;
        } else {
            setLotteryBrandNameInvalidMsg("Lottery Brand Name cannot be empty value");
            flag = false;
        }
        if (address != null && address.trim().length > 0) {
            setAddressInvalidMsg("");
            flag = true;
        } else {
            setAddressInvalidMsg("Address cannot be empty value");
            flag = false;
        }
        if (phoneNumber != null && phoneNumber.trim().length > 0) {
            setPhoneNumberInvalidMsg("");
            flag = true;
        } else {
            setPhoneNumberInvalidMsg("Phone Number cannot be empty value");
            flag = false;
        }
        if (thankYouMessage != null && thankYouMessage.trim().length > 0) {
            setThankyouMessageInvalidMsg("");
            flag = true;
        } else {
            setThankyouMessageInvalidMsg("Thank you message cannot be empty value");
            flag = false;
        }
        if (termsAndConditions != null && termsAndConditions.trim().length > 0) {
            setTermsAndConditionsInvalidMsg("");
            flag = true;
        } else {
            setTermsAndConditionsInvalidMsg("T&C cannot be empty value");
            flag = false;
        }
        if (footer != null && footer.trim().length > 0) {
            setFooterInvalidMsg("");
            flag = true;
        } else {
            setFooterInvalidMsg("Footer cannot be empty value");
            flag = false;
        }
        return flag;
    }

    const showPageAlert = (displayMsg) => {
        setShowAlert(true);
        setAlertMessage(displayMsg)
        setTimeout(() => {
            setShowAlert(false);
            setAlertMessage('');
        }, 4000)
    }
    const showPageErrorAlert = (alertMessage) => {
        setShowErrorAlert(true);
        setAlertMessage(alertMessage)
        setTimeout(() => {
            setShowErrorAlert(false);
            setAlertMessage('');
        }, 4000)
    }

    useEffect(getReceiptData, [])

    const refreshPage = () => {
        setReceiptLogoInvalidMsg("");
        setReceiptLogo(defaultImage);
        setHeaderInvalidMsg("");
        setHeader("");
        setLotteryBrandNameInvalidMsg("");
        setLotteryBrandName("");
        setAddressInvalidMsg("");
        setAddress("");
        setPhoneNumberInvalidMsg("");
        setPhoneNumber("");
        setThankyouMessageInvalidMsg("");
        setThankyouMessage("");
        setTermsAndConditionsInvalidMsg("");
        setTermsAndConditions("");
        setFooterInvalidMsg("");
        setFooter("");
        getReceiptData();
    }

    return (
        <>
            {
                loadingPage && <CenterFantasyLoader />
            }
        {
            <div class="customiseReceiptLayout">
                <div class="receiptTextLayout">
                <div class="customiseReceiptsHeader">Customise receipts</div>
                    <div class="receipt">
                        <img class={`receiptLogo ${receiptLogoInvalidMsg?'error': ''}`} src={receiptLogo} alt={defaultImage} />
                        <div className="formErrorMessage">{receiptLogoInvalidMsg}</div>
                        <PrimaryButton label="Upload Logo" style={{ width: "110px", height: "40px", padding: "10px 0px" }} type="secondary" onClick={handleClick} />
                        <input type="file" style={{ "display": "none" }} ref={hiddenFileInput} onChange={handleChange} />
                    </div>
                    <TextInputv2 label={"Header"} maskInput={false} width={"width:100%"} disabled={false} onChange={setHeader} value = {header} errorState={headerInvalidMsg} errorMessage={headerInvalidMsg} />
                    <div className="formErrorMessage">{headerInvalidMsg}</div>
                    <TextInputv2 label={"Lottery brand name"} maskInput={false} width={"width:100%"} disabled={false} onChange={setLotteryBrandName} defaultValue = {lotteryBrandName} errorState={lotteryBrandNameInvalidMsg} errorMessage={lotteryBrandNameInvalidMsg} />
                    <div className="formErrorMessage">{lotteryBrandNameInvalidMsg}</div>
                    <TextInputv2 label={"Address"} maskInput={false} width={"width:100%"} disabled={false} onChange={setAddress} defaultValue = {address} errorState={addressInvalidMsg} errorMessage={addressInvalidMsg} />
                    <div className="formErrorMessage">{addressInvalidMsg}</div>
                    <TextInputv2 label={"Phone number"} maskInput={false} width={"width:100%"} disabled={false} onChange={setPhoneNumber} defaultValue = {phoneNumber} errorState={phoneNumberInvalidMsg} errorMessage={phoneNumberInvalidMsg} />
                    <div className="formErrorMessage">{phoneNumberInvalidMsg}</div>
                    <TextInputv2 label={"Thank you message"} maskInput={false} width={"width:100%"} disabled={false} onChange={setThankyouMessage} defaultValue = {thankYouMessage} errorState={thankYouMessageInvalidMsg} errorMessage={thankYouMessageInvalidMsg} />
                    <div className="formErrorMessage">{thankYouMessageInvalidMsg}</div>
                    <div className={`textarea ${termsAndConditionsInvalidMsg ? 'error' : ''}`}>
                        <TextArea
                            label="Terms & Conditions"
                            rows={3}
                            maskInput={false}
                            width="width:100%"
                            disabled={false}
                            onChange={setTermsAndConditions}
                            defaultValue={termsAndConditions}
                            errorState={termsAndConditionsInvalidMsg}
                            errorMessage={termsAndConditionsInvalidMsg}
                        />
                        </div>
                    <div className="formErrorMessage">{termsAndConditionsInvalidMsg}</div>
                    <TextInputv2 label={"Footer"} maskInput={false} width={"width:100%"} disabled={false} onChange={setFooter} defaultValue = {footer} errorState={footerInvalidMsg} errorMessage={footerInvalidMsg} />
                    <div className="formErrorMessage">{footerInvalidMsg}</div>
                    <div class="custReceiptsButtons">
                        <PrimaryButton label={"Cancel"} onClick={refreshPage} style={{ "background-color": "white", "color": "black", "border": "none" }} type={"primary"} />
                        <PrimaryButton label={"Update"} onClick={saveChanges} style={{}} type={"primary"} />
                    </div>
                </div>
                <div class="receiptPreviewLayout">
                    <div class="previewHeader">Preview</div>
                    <div class="receiptPreviewSection">
                        <div class="receiptTopBlock">
                            <div class="previewReceiptHeader">{header !== '' ? header : '<Header goes here>'}</div>
                            <div><img class="receiptLogo" src={receiptLogo} /></div>
                            <div>{lotteryBrandName !== '' ? lotteryBrandName : '<Brand name goes here>'}</div>
                            <div>{address !== '' ? address : '<Address goes here>'}</div>
                            <div>{phoneNumber !== '' ? phoneNumber : '<Phone number goes here>'}</div>
                        </div>
                        <div class="receiptMiddleBlock">
                            <div><img src={betType} /></div>
                            <div><img src={receiptQR} /></div>
                            <div><img src={ticketDetail} /></div>
                            <div><img src={gameDetail} /></div>
                        </div>
                        <div class="receiptBottomBlock">
                            <div class="previewThanks">{thankYouMessage !== '' ? thankYouMessage : '<Thank you message goes here>'}</div>
                            <div className="previewTextarea">{termsAndConditions !== '' ? termsAndConditions : '<Terms & Conditions goes here>'}</div>
                            <div class="previewFooter">{footer !== '' ? footer : '<Footer goes here>'}</div>
                        </div>
                    </div>
                </div>
            </div>
        }
    {showAlert && 
        <Alert 
            message={alertMessage}
            style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
            onClick={()=>setShowAlert(false)}
        />
      }
      {showErrorAlert && 
        <ErrorAlert 
            message={alertMessage}
            style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
            onClick={()=>setShowErrorAlert(false)}
        />
      }
      </>
    );
}
