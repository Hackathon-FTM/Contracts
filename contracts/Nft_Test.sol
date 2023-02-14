pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract TestNFT is ERC1155 {

constructor() ERC1155("0x0") {

}

uint id;

function mint() public {
    _mint(msg.sender, id, 1, "0x0");
    id++;
}

}
