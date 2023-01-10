// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract tradeToken is ERC20, Ownable {
    constructor() ERC20("TRADE TOKEN", "TRD") {}
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}