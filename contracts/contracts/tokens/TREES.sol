// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TREES is ERC20, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million max supply
    
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor() ERC20("Sherwood TREES", "TREES") ERC20Permit("Sherwood TREES") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 10_000_000 * 10**18); // 10 million initial supply
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "TREES: max supply exceeded");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    function burnFrom(address from, uint256 amount) external {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        emit Burned(from, amount);
    }
}
