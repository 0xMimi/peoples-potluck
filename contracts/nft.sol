// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";
import "./ExpiryHelper.sol";

contract NFT is ExpiryHelper {
    address private owner;

    mapping(address => int64) serials;
    mapping(int64 => bool) approval;

    address tokenAddress;

    bool created;

    constructor() {
        owner = msg.sender; //Set owner to contract deployer
        tokenAddress = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function createToken(
        string memory name,
        string memory symbol,
        string memory memo,
        uint32 autoRenewPeriod
    ) public payable onlyOwner returns (address) {
        require(created == false);

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);
        // Set this contract as supply
        keys[0] = getSingleKey(
            HederaTokenService.SUPPLY_KEY_TYPE,
            KeyHelper.CONTRACT_ID_KEY,
            address(this)
        );

        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = memo;
        token.treasury = address(this);
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = getAutoRenewExpiry(address(this), autoRenewPeriod); // Contract automatically renew by himself

        (int256 responseCode, address createdToken) = HederaTokenService
            .createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Failed to create non-fungible token");
        }
        created = true;
        tokenAddress = createdToken;
        return createdToken;
    }

    function mint(address receiver, bytes[] memory metadata)
        external
        onlyOwner
        returns (int64)
    {
        (int256 response, , int64[] memory serial) = HederaTokenService
            .mintToken(tokenAddress, 0, metadata);

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to mint non-fungible token");
        }
        serials[receiver] = serial[0];
        approval[serial[0]] = true;
        return serial[0];
    }

    function withdraw(int64 serial) external returns (int256) {
        require(serials[msg.sender] == serial); //User can only withdraw nft associated to them

        HederaTokenService.associateToken(msg.sender, tokenAddress);
        int256 response = HederaTokenService.transferNFT(
            tokenAddress,
            address(this),
            msg.sender,
            serial
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to transfer non-fungible token");
        }

        return response;
    }

    function revoke(int64 serial) external onlyOwner {
        approval[serial] = false;
    }

    function canWithdraw(address sender, int64 serial)
        external
        view
        returns (bool)
    {
        if (serials[sender] == 0) return false;
        return approval[serial];
    }
}
