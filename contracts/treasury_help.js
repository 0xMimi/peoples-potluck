console.clear()
require("dotenv").config();
const {
    AccountId,
    PrivateKey,
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractCallQuery,
    Hbar,
    ContractId,
    TokenCreateTransaction,
    PublicKey,
    TokenType,
    AccountBalanceQuery,
    TokenInfoQuery,
    TokenId,
    ContractCreateFlow,
    TransferTransaction
} = require("@hashgraph/sdk");

const fs = require("fs");
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const bytecode = fs.readFileSync("treasury_sol_Treasury.bin");

async function createContract(bytecode) {
    const createContract = new ContractCreateFlow()
        .setGas(300000) // Increase if revert
        .setBytecode(bytecode); // Contract bytecode
    const createContractTx = await createContract.execute(client);
    const createContractRx = await createContractTx.getReceipt(client);
    const contractId = createContractRx.contractId;

    console.log(`Contract created with ID: ${contractId} \n`);
}

const contractId = ContractId.fromString("0.0.46027012");
const accountId = AccountId.fromString("0.0.46027012");

async function main() {
    // createContract(bytecode);

    // Set NFT contract address
    const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("setNftAddr", new ContractFunctionParameters()
            .addAddress(ContractId.fromString("0.0.46027264").toSolidityAddress()))
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " + transactionStatus);

    //Check withdrawable
    // const query = new ContractCallQuery()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("withdrawable", new ContractFunctionParameters()
    //         .addAddress(AccountId.fromString("0.0.45960933").toSolidityAddress())
    //         .addInt64(1)
    //     );
    // const contractCallResult = await query.execute(client);
    // const message = contractCallResult.getBool(0);
    // console.log("contract message: " + message);

    // Check balance
    // const query = new ContractCallQuery()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("balance");
    // const contractCallResult = await query.execute(client);
    // const message = contractCallResult.getUint256(0);
    // console.log("contract message: " + message);

    // //Withdraw
    // const transaction = new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("withdraw", new ContractFunctionParameters()
    //         .addInt64(1));
    // const txResponse = await transaction.execute(client);
    // const receipt = await txResponse.getReceipt(client);
    // const transactionStatus = receipt.status;
    // console.log("The transaction consensus status is " + transactionStatus);

    //Donate
    // const sendHbar = await new TransferTransaction()
    //     .addHbarTransfer(operatorId, new Hbar(-1000)) //Sending account
    //     .addHbarTransfer(accountId, new Hbar(1000)) //Receiving account
    //     .execute(client);

    // const transactionReceipt = await sendHbar.getReceipt(client);
    // console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    // const getNewBalance = await new AccountBalanceQuery()
    //     .setAccountId(accountId)
    //     .execute(client);

    // console.log("The account balance after the transfer is: " + getNewBalance.hbars.toTinybars() + " tinybar.")


}

main();