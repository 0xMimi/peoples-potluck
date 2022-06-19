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
    TokenType,
    TokenSupplyType,
    ContractCreateFlow,
    TokenId,
    TokenCreateTransaction,
    TokenGrantKycTransaction,
    TokenInfoQuery
} = require("@hashgraph/sdk");

const fs = require("fs");

const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const bytecode = fs.readFileSync("nft_sol_NFT.bin");

async function createContract(bytecode) {
    const createContract = new ContractCreateFlow()
        .setGas(300000) // Increase if revert
        .setBytecode(bytecode); // Contract bytecode
    const createContractTx = await createContract.execute(client);
    const createContractRx = await createContractTx.getReceipt(client);
    const contractId = createContractRx.contractId;

    console.log(`Contract created with ID: ${contractId} \n`);
}


const contractId = ContractId.fromString("0.0.46027264");

async function main() {
    //Create contract
    // createContract(bytecode);

    //Create token
    // const createToken = new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(300000) // Increase if revert
    //     .setPayableAmount(20) // Increase if revert
    //     .setFunction("createToken",
    //         new ContractFunctionParameters()
    //         .addString("Peoples Potluck Access Card") // NFT name
    //         .addString("PP") // NFT symbol
    //         .addString("Just a memo") // NFT memo
    //         .addUint32(7000000) // Expiration: Needs to be between 6999999 and 8000001
    //     );
    // const createTokenTx = await createToken.execute(client);
    // const createTokenRx = await createTokenTx.getRecord(client);
    // const tokenIdSolidityAddr = createTokenRx.contractFunctionResult.getAddress(0);
    // const tokenId = AccountId.fromSolidityAddress(tokenIdSolidityAddr);

    // console.log(`Token created with ID: ${tokenId} \n`);


    //////////
    const tokenId = AccountId.fromString("0.0.46027265")

    // //Mint token
    // const mintToken = new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(1000000)
    //     .setFunction("mint",
    //         new ContractFunctionParameters()
    //         .addAddress(operatorId.toSolidityAddress()) // Receiver address
    //         .addBytesArray([Buffer.from("metadata")]) // Metadata
    //     );
    // const mintTokenTx = await mintToken.execute(client);
    // const mintTokenRx = await mintTokenTx.getRecord(client);
    // const serial = mintTokenRx.contractFunctionResult.getInt64(0);

    // console.log(`Minted NFT with serial: ${serial} \n`);


    // //Withdraw token
    const transferToken = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction("withdraw",
            new ContractFunctionParameters()
            .addInt64(2)) // NFT serial number
        .freezeWith(client) // freezing using client
        .sign(operatorKey); // Sign transaction
    const transferTokenTx = await transferToken.execute(client);
    const transferTokenRx = await transferTokenTx.getReceipt(client);

    console.log(`Transfer status: ${transferTokenRx.status} \n`);


}
main();