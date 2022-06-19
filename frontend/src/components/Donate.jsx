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

import { TransferTransaction, AccountId } from "@hashgraph/sdk";

const contractId = AccountId.fromString("0.0.46027012");

async function sendFund(hashconnect, provider, signer, amount, senderId) {
    let trans = await new TransferTransaction()
        .addHbarTransfer(AccountId.fromString(senderId), -amount)
        .addHbarTransfer(contractId, amount)
        .freezeWithSigner(signer);

    let res = await trans.executeWithSigner(signer);
}

function Donate({ donateOpen, handleClose, topic, accountId, hashconnect }) {
    const provider = hashconnect.getProvider("testnet", topic, accountId);
    const signer = hashconnect.getSigner(provider);

    const [amount, setAmount] = useState(0);
    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    return (
        <div>
            <Dialog open={donateOpen}>
                <DialogTitle>Donate</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Input the amount to donate
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="amount"
                        label="Amount"
                        type="number"
                        fullWidth
                        variant="standard"
                        value={amount}
                        onChange={handleAmountChange}
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            handleClose();
                            setAmount(0);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            sendFund(
                                hashconnect,
                                provider,
                                signer,
                                amount,
                                accountId
                            );
                            setAmount(0);
                            handleClose();
                        }}
                    >
                        Donate
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Donate;
