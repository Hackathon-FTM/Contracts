pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";


contract PS_PAIRV1 is ERC1155Holder {

// This public parameter specifies the address of the NFT collection.
address public nftAddress;
// The address of the token being used for the exchange.
address public tokenAddress;
// This constant sets the maximum fee percentage that can be charged for the transaction (5%).
uint constant MAX_FEE = 50; 
// Sets the initial price of the NFTs.
uint128 spotPrice;
// The change in price of the NFTs, based on the spot price.
uint128 delta;
// The fee charged by the exchange pool, capped at MAX_FEE.
uint16 fee;
// This constant sets the percentage of the transaction value charged as a protocol fee (0.5%).
uint constant PS_FEE = 5;
// This parameter specifies the type of price curve used for the exchange (linear or exponencial).
bool isLinear;


// Function is initialized at contract creation
function initialize(
    uint16 _fee,
    uint128 _spotPrice,
    uint128 _delta,
    address _nftAddress,
    address _tokenAddress,
    address _router,
    uint _tokenAmount,
    uint[] memory nftID,
    bool _isLinear
) public {
require(nftAddress == address(0x0), "Already Init");
// require(_nftAddress != address(0), "Address 0 not supported");
fee = _fee;
spotPrice = _spotPrice;
delta = _delta;
nftAddress = _nftAddress;
tokenAddress = _tokenAddress;
isLinear = _isLinear;
sendTokensToContract(msg.sender, _tokenAmount, _tokenAddress); 
sendNFTsToContract(msg.sender, nftID); 
}


/* 
@param nftIDS | This parameter 'nftIDS' specifies the unique identification numbers of the NFTs that you wish to exchange for tokens
@param minValue | Sets the minimum value at which you are willing to exchange your NFT. If this minimum value is not met, the transaction will be automatically reverted.
@param isRouter | is a boolean value that indicates whether the sender of the transaction is the router or not.
@param _from | If 'isRouter' is set to true, this parameter '_from' will be used to determine the actual sender of the transaction (i.e., 'msg.sender')
*/
function swapNFTsForTokens(
    uint[] memory nftIDS,
    uint minValue,
    bool isRouter,
    address _from

) public {
    IERC1155 nftContract = IERC1155(nftAddress);
    
}


function sendTokensToContract(
    address _from,
    uint amount,
    address add
) internal {
  IERC20 token = IERC20(add);
  token.transferFrom(_from, address(this), amount);
}

function sendNFTsToContract(
    address _from,
    uint[] memory nftID
) internal {

}





}