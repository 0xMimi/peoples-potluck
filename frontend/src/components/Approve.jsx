import { useState, useEffect } from "react";
import {
    AccountId,
    Hbar,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId,
} from "@hashgraph/sdk";
import {
    Button,
    Dialog,
    DialogContent,
    AppBar,
    Toolbar,
    IconButton,
    Box,
    TableRow,
    TableBody,
    TableCell,
} from "@mui/material";

function getApplications(setData) {
    fetch("https://peoplespotluck.herokuapp.com/getApplications")
        .then((response) => response.json())
        .then((data) => {
            setData(data.results);
            console.log(data);
        });
}
const contractId = ContractId.fromString("0.0.46027264"); //NFT

async function approveApplication(signer, receiver) {
    console.log(receiver);
    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction(
            "mint",
            new ContractFunctionParameters()
                .addAddress(AccountId.fromString(receiver).toSolidityAddress())
                .addBytesArray([Buffer.from("metadata")]) // Metadata
        )
        .setMaxTransactionFee(new Hbar(0.75))
        .freezeWithSigner(signer);
    const contractSign = (await contractExecuteTx).signWithSigner(signer);
    const contractSubmit = await (await contractSign).executeWithSigner(signer);
}

function Approve({ open, handleClose, hashconnect, topic, accountId }) {
    const provider = hashconnect.getProvider("testnet", topic, accountId);
    const signer = hashconnect.getSigner(provider);

    const [data, setData] = useState([]);

    useEffect(() => {
        getApplications(setData);
    }, []);

    return (
        <div>
            <Dialog open={open} fullScreen>
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            {"X"}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    {data.map((item) => {
                        return (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 300,
                                        height: 300,
                                        backgroundColor: "primary.main",
                                        border: "3px solid white",
                                    }}
                                >
                                    <TableBody>
                                        <TableRow>
                                            <TableCell scope="row">
                                                First Name
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.firstName}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell scope="row">
                                                Last Name
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.lastName}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell scope="row">
                                                Phone Number
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.phoneNumber}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell scope="row">
                                                Account ID
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.accountId}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell scope="row">
                                                Approved
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.approved.toString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            approveApplication(
                                                signer,
                                                item.accountId
                                            );
                                        }}
                                    >
                                        O
                                    </Button>
                                </Box>
                            </>
                        );
                    })}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Approve;
