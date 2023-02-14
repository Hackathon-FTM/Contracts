pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract DAI is ERC20 {

constructor() ERC20("DAI", "DAI") {}

function mint(uint amount) public {
    
    _mint(msg.sender, amount);
}

}