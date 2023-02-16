pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract TestNFT is ERC721Enumerable {

constructor() ERC721("0x0", "") {

}

uint id;

function mint() public {
    _mint(msg.sender, id);
    id++;
}

}
