import "./App.css";
import Navbar from "./components/Navbar";
import Donate from "./components/Donate";
import Apply from "./components/Apply";
import Approve from "./components/Approve";
import { HashConnect } from "hashconnect";
import { useState, useEffect } from "react";

import { Button, ButtonGroup } from "@mui/material";
import {
    ContractId,
    Hbar,
    ContractExecuteTransaction,
    ContractFunctionParameters,
} from "@hashgraph/sdk";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChfQTvu13lqhNgJ5715-c9Ix5lJB-wTFo",
    authDomain: "peoples-potluck.firebaseapp.com",
    projectId: "peoples-potluck",
    storageBucket: "peoples-potluck.appspot.com",
    messagingSenderId: "410112518216",
    appId: "1:410112518216:web:db7dd83dbc1c7daa89507d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const treasuryContractId = "0.0.46027012";
const contractId = ContractId.fromString(treasuryContractId);

const nftContractId = ContractId.fromString("0.0.46027264");

const tokenId = "0.0.46027265";

let accountId = "";
let hashconnect = new HashConnect();
let saveData = {
    topic: "",
    pairingString: "",
    privateKey: "",
    pairedWalletData: null,
    pairedAccounts: [],
};

let appMetadata = {
    name: "The Peoples Potluck",
    description: "A semi-decentralized charity fund",
    icon: "https://absolute.url/to/icon.png", // TODO
};

async function walletConnect(setAccId) {
    let initData = await hashconnect.init(appMetadata);
    saveData.privateKey = initData.privKey;

    let state = await hashconnect.connect();
    saveData.topic = state.topic;

    console.log(`Topic is: ${saveData.topic}\n`);

    saveData.pairingString = hashconnect.generatePairingString(
        state,
        "testnet",
        false
    );

    const result = hashconnect.findLocalWallets();
    console.log(result + " result");

    hashconnect.connectToLocalWallet(saveData.pairingString);

    hashconnect.pairingEvent.once((pairingData) => {
        pairingData.accountIds.forEach((id) => {
            accountId = id;
            setAccId(accountId);
            console.log(accountId);
        });
    });
}

async function withdraw(serial) {
    const provider = hashconnect.getProvider(
        "testnet",
        saveData.topic,
        accountId
    );
    const signer = hashconnect.getSigner(provider);

    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
            "withdraw",
            new ContractFunctionParameters().addInt64(parseInt(serial))
        )
        .setMaxTransactionFee(new Hbar(0.75))
        .freezeWithSigner(signer);
    const contractSign = (await contractExecuteTx).signWithSigner(signer);
    const contractSubmit = await (await contractSign).executeWithSigner(signer);
}

async function claim(serial) {
    const provider = hashconnect.getProvider(
        "testnet",
        saveData.topic,
        accountId
    );
    const signer = hashconnect.getSigner(provider);

    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(nftContractId)
        .setGas(100000)
        .setFunction(
            "withdraw",
            new ContractFunctionParameters().addInt64(parseInt(serial))
        )
        .setMaxTransactionFee(new Hbar(0.75))
        .freezeWithSigner(signer);
    const contractSign = (await contractExecuteTx).signWithSigner(signer);
    const contractSubmit = await (await contractSign).executeWithSigner(signer);
}

function isAdmin(accId) {
    return accId === "0.0.45960933";
}

function getBalance(setBalance) {
    fetch(
        "https://testnet.mirrornode.hedera.com/api/v1/balances?account.id=" +
            treasuryContractId
    )
        .then((response) => response.json())
        .then((data) => {
            const bal = data.balances[0].balance;
            const realBal = Math.floor(parseInt(bal) / 100000000);
            setBalance(realBal);
        });
}

function getSerial2(accountId) {
    fetch(`https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts`)
        .then((response) => response.json())
        .then((data) => {
            const nftObj = data.nfts.filter(
                (nft) => nft.account_id == accountId
            );
            console.log(nftObj);
            if (nftObj.length > 0) {
                const serial = nftObj[0].serial_number;
                claim(serial);
            }
        });
}

function getSerial(accountId) {
    fetch(`https://testnet.mirrornode.hedera.com/api/v1/tokens/${tokenId}/nfts`)
        .then((response) => response.json())
        .then((data) => {
            const nftObj = data.nfts.filter(
                (nft) => nft.account_id == accountId
            );
            if (nftObj.length > 0) {
                const serial = nftObj[0].serial_number;
                withdraw(serial);
            }
        });
}

function App() {
    const [accId, setAccId] = useState(0);
    const [balance, setBalance] = useState(0);
    useEffect(() => {
        getBalance(setBalance);
    }, []);

    useEffect(() => {
        walletConnect(setAccId);
    }, []);

    const [donateOpen, setDonateOpen] = useState(false);
    const handleDonateOpen = () => {
        setDonateOpen(true);
    };
    const handleDonateClose = () => {
        setDonateOpen(false);
    };

    const [applyOpen, setApplyOpen] = useState(false);
    const handleApplyOpen = () => {
        setApplyOpen(true);
    };
    const handleApplyClose = () => {
        setApplyOpen(false);
    };

    const [approveOpen, setApproveOpen] = useState(false);
    const handleApproveOpen = () => {
        setApproveOpen(true);
    };
    const handleApproveClose = () => {
        setApproveOpen(false);
    };

    return (
        <div className="App">
            <Navbar
                isAdmin={isAdmin(accId)}
                walletConnectFn={walletConnect}
                setAccId={setAccId}
                accId={accId}
                applyOpen={applyOpen}
                handleApplyClose={handleApplyClose}
                handleApplyOpen={handleApplyOpen}
                approveOpen={approveOpen}
                handleApproveClose={handleApproveClose}
                handleApproveOpen={handleApproveOpen}
            />
            <h1>{balance}</h1>
            <ButtonGroup variant="contained">
                <Button onClick={handleDonateOpen}>Donate</Button>
                <Button
                    onClick={() => {
                        console.log(accId);
                        getSerial(accId);
                    }}
                >
                    Withdraw
                </Button>
            </ButtonGroup>
            <Donate
                donateOpen={donateOpen}
                handleClose={handleDonateClose}
                handleOpen={handleDonateOpen}
                topic={saveData.topic}
                accountId={accId}
                hashconnect={hashconnect}
            />
            <Apply
                open={applyOpen}
                handleClose={handleApplyClose}
                accountId={accId}
            />
            <Approve
                open={approveOpen}
                handleClose={handleApproveClose}
                hashconnect={hashconnect}
                topic={saveData.topic}
                accountId={accId}
            />
        </div>
    );
}

export default App;
