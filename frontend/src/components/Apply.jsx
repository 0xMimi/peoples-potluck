import { useState } from "react";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
} from "@mui/material";

function Apply({ open, handleClose, accountId }) {
    const [firstName, setFirstName] = useState("");
    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
    };

    const [lastName, setLastName] = useState("");
    const handleLastNameChange = (e) => {
        setLastName(e.target.value);
    };

    const [phoneNumber, setPhoneNumber] = useState("");
    const handlePhoneNumberChange = (e) => {
        setPhoneNumber(e.target.value);
    };

    const [verifCode, setVerifCode] = useState("");
    const hadnleVerifChange = (e) => {
        setVerifCode(e.target.value);
    };

    const [disabled, setDisabled] = useState(true);

    function sendVerif() {
        fetch("https://peoplespotluck.herokuapp.com//sendVerif", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber: phoneNumber }),
        });
    }

    function submitVerif() {
        fetch("https://peoplespotluck.herokuapp.com/submitVerif", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber: phoneNumber, code: verifCode }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "approved") {
                    setDisabled(false);
                }
            });
    }

    function submitForm() {
        fetch("https://peoplespotluck.herokuapp.com//submitApplication", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                accountId: accountId,
            }),
        });
    }

    return (
        <div>
            <Dialog open={open}>
                <DialogTitle>Apply</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Apply for an access NFT
                    </DialogContentText>
                    <TextField
                        label="First Name"
                        type="string"
                        fullWidth
                        margin="dense"
                        value={firstName}
                        onChange={handleFirstNameChange}
                    ></TextField>
                    <TextField
                        label="Last Name"
                        type="string"
                        fullWidth
                        margin="dense"
                        value={lastName}
                        onChange={handleLastNameChange}
                    ></TextField>
                    <TextField
                        label="Phone Number"
                        type="tel"
                        fullWidth
                        margin="dense"
                        helperText="Include country code"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                    ></TextField>
                    <TextField
                        label="Verification Code"
                        type="string"
                        fullWidth
                        margin="dense"
                        value={verifCode}
                        onChange={hadnleVerifChange}
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            handleClose();
                            setFirstName("");
                            setLastName("");
                            setPhoneNumber("");
                            setVerifCode("");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={sendVerif}>Get Code</Button>
                    <Button onClick={submitVerif}>Verify</Button>
                    <Button
                        disabled={disabled}
                        onClick={() => {
                            submitForm();
                            handleClose();
                            setFirstName("");
                            setLastName("");
                            setPhoneNumber("");
                            setVerifCode("");
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Apply;
