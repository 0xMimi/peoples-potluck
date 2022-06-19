// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";
import "./ExpiryHelper.sol";

interface NFT {
    function canWithdraw(address sender, int64 serial)
        external
        view
        returns (bool);
}

contract Treasury {
    mapping(int64 => uint256) lastClaim; //Serial => timestamp

    uint40 constant DELAY = 10; //2592000;
    uint256 constant WITHDRAW_AMOUNT = 10000000000;

    address nftAddr;
    address owner;
    address tokenAddr;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setNftAddr(address addr) external payable onlyOwner {
        nftAddr = addr;
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(int64 serial) public {
        require(withdrawable(msg.sender, serial), "NotOwner");
        require(
            address(this).balance > WITHDRAW_AMOUNT,
            "Insufficient treasury balance"
        );

        lastClaim[serial] = block.timestamp;
        payable(msg.sender).transfer(WITHDRAW_AMOUNT);
    }

    function withdrawable(address _address, int64 serial)
        public
        view
        returns (bool)
    {
        if (NFT(nftAddr).canWithdraw(_address, serial) == false) return false;
        if (block.timestamp - lastClaim[serial] < DELAY) return false;

        return true;
    }
}
