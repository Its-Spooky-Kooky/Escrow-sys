// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public client;
    address public freelancer;
    uint public amount;
    bool public isFunded;
    bool public isReleased;

    constructor(address _freelancer) payable {
        client = msg.sender;
        freelancer = _freelancer;
        amount = msg.value;
        isFunded = true;
    }

    function releaseFunds() public {
        require(msg.sender == client, "Only client can release");
        require(isFunded && !isReleased, "Invalid state");

        isReleased = true;
        payable(freelancer).transfer(amount);
    }

    function refundClient() public {
        require(msg.sender == client, "Only client can refund");
        require(isFunded && !isReleased, "Invalid state");

        isReleased = true;
        payable(client).transfer(amount);
    }
}
