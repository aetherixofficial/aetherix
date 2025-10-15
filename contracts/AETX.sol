// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AETX is ERC20, Ownable {
    mapping(address => bool) public hasClaimedTestTokens;

    constructor() ERC20("AETX Token", "AETX") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function claimTestTokens() external {
        require(!hasClaimedTestTokens[msg.sender], "Already claimed");
        hasClaimedTestTokens[msg.sender] = true;
        _transfer(address(this), msg.sender, 1000 * 10 ** decimals());
    }
}