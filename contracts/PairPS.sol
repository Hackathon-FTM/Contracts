pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./CurveTypes.sol";

contract PS_PAIRV1 is ERC721Holder {
    // This public parameter specifies the address of the NFT collection.
    address public nftAddress;
    // The address of the token being used for the exchange.
    address public tokenAddress;

    address public router;

    address public curve;

    address owner;

    // This constant sets the maximum fee percentage that can be charged for the transaction (10%).
    uint256 constant MAX_FEE = 100;
    // Sets the initial price of the NFTs.
    uint256 spotPrice;
    // The change in price of the NFTs, based on the spot price.
    uint256 delta;
    // The fee charged by the exchange pool, capped at MAX_FEE.
    uint256 fee;
    // This constant sets the percentage of the transaction value charged as a protocol fee (0.5%).
    uint256 constant PS_FEE = 5;
    // This parameter specifies the type of price curve used for the exchange (linear or exponencial).
    bool isLinear;

    // Function is initialized at contract creation
    function initialize(
        uint256 _fee,
        uint256 _spotPrice,
        uint256 _delta,
        address _nftAddress,
        address _tokenAddress,
        address _router,
        address _curve,
        address _owner,
        uint256 _tokenAmount,
        uint256[] memory nftID,
        bool _isLinear
    ) public {
        require(owner == address(0x0), "Already Init");
        require(_owner != address(0x0), "Address 0 not supported");
        require(fee <= MAX_FEE, "Fee to High");
        IERC20 token = IERC20(_tokenAddress);
        IERC721 nftContract = IERC721(_nftAddress);
        CurveTypes curveContract = CurveTypes(_curve);

        // Declare Variables
        owner = _owner;
        curve = _curve;
        fee = _fee;
        spotPrice = _spotPrice;
        delta = _delta;
        nftAddress = _nftAddress;
        tokenAddress = _tokenAddress;
        isLinear = _isLinear;
        router = _router;

        // Check Params
        require(
            curveContract.validateTokensAndNFTsSent(
                _delta,
                _spotPrice,
                nftID.length,
                _tokenAmount,
                _isLinear
            ),
            "Invalid Params"
        );
        require(
            curveContract.validateDelta(_delta, _isLinear),
            "Invalidad Delta"
        );
        require(
            curveContract.validateSpotPrice(_spotPrice, _isLinear),
            "Invalid Spot Price"
        );

        // Send Tokens & NFTs
        sendTokens(_owner, _tokenAmount, address(this), token);
        _sendNFTsToContract(_owner, nftID, nftContract);
    }

    /* 
@param nftIDS | This parameter 'nftIDS' specifies the unique identification numbers of the NFTs that you wish to exchange for tokens
@param minValue | Sets the minimum value at which you are willing to exchange your NFT. If this minimum value is not met, the transaction will be automatically reverted.
@param isRouter | is a boolean value that indicates whether the sender of the transaction is the router or not.
@param _from | If 'isRouter' is set to true, this parameter '_from' will be used to determine the actual sender of the transaction (i.e., 'msg.sender')
*/
    function swapNFTsForTokens(
        uint256[] memory nftIDS,
        uint256 minValue,
        bool isRouter,
        address _from
    ) public {
        require(owner != address(0x0), "Contract is not Initialized");
        CurveTypes _curve = CurveTypes(curve);
        IERC20 token = IERC20(tokenAddress);
        IERC721 nftContract = IERC721(nftAddress);

        (
            uint256 newSpotPrice,
            uint256 sellPrice,
            uint256 poolFee,
            uint256 protocolFee
        ) = _curve.getSellInfo(
                spotPrice,
                delta,
                nftIDS.length,
                fee,
                PS_FEE,
                isLinear
            );
         require(minValue <= sellPrice, "Sell Price too low");
         spotPrice = newSpotPrice;

        address sender = isRouter ? _from : msg.sender;

        _sendNFTsToContract(sender, nftIDS, nftContract);
        sendTokens(address(this), protocolFee, router, token);
        sendTokens(address(this), poolFee, owner, token);
        sendTokens(address(this), sellPrice, sender, token);
    }

    function swapTokensForSpecificNFTs(
        uint256[] memory nftIDS,
        uint256 maxAmount,
        bool isRouter,
        address _from
    ) public {
        require(owner != address(0x0), "Contract is not Initialized");
        CurveTypes _curve = CurveTypes(curve);
        IERC20 token = IERC20(tokenAddress);
        IERC721 nftContract = IERC721(nftAddress);

        (
            uint256 newSpotPrice,
            uint256 inputValue,
            uint256 poolFee,
            uint256 protocolFee
        ) = _curve.getBuyInfo(
                spotPrice,
                delta,
                nftIDS.length,
                fee,
                PS_FEE,
                isLinear
            );
        require(inputValue <= maxAmount, "Max Amount is too low");
        spotPrice = newSpotPrice;

        address sender = isRouter ? _from : msg.sender;
        sendTokens(sender, inputValue, address(this), token);
        sendTokens(address(this), protocolFee, router, token);
        sendTokens(address(this), poolFee, owner, token);
        _sendSpecificNFTstoSender(nftContract, sender, nftIDS);
    }

    function swapTokensForAnyNFTs(
        uint256 nftAmount,
        uint256 maxAmount,
        bool isRouter,
        address _from
    ) public {
        require(owner != address(0x0), "Contract is not Initialized");
        CurveTypes _curve = CurveTypes(curve);
        IERC20 token = IERC20(tokenAddress);
        IERC721 nftContract = IERC721(nftAddress);

        (
            uint256 newSpotPrice,
            uint256 inputValue,
            uint256 poolFee,
            uint256 protocolFee
        ) = _curve.getBuyInfo(
                spotPrice,
                delta,
                nftAmount,
                fee,
                PS_FEE,
                isLinear
            );
        require(inputValue <= maxAmount, "Max Amount is too low");
        spotPrice = newSpotPrice;

        address sender = isRouter ? _from : msg.sender;
        sendTokens(sender, inputValue, address(this), token);
        sendTokens(address(this), protocolFee, router, token);
        sendTokens(address(this), poolFee, owner, token);
        _sendAnyNFTsToSender(nftContract, sender, nftAmount);
    }

    function _sendAnyNFTsToSender(
        IERC721 nftContract,
        address sender,
        uint256 numNFTs
    ) internal {
        uint256 lastIndex = nftContract.balanceOf(address(this)) - 1;

        for (uint256 i = 0; i < numNFTs; ) {
            uint256 nftId = IERC721Enumerable(address(nftContract))
                .tokenOfOwnerByIndex(address(this), lastIndex);
            nftContract.safeTransferFrom(address(this), sender, nftId);

            unchecked {
                --lastIndex;
                ++i;
            }
        }
    }

    function _sendSpecificNFTstoSender(
        IERC721 nftContract,
        address sender,
        uint256[] memory numNFTs
    ) internal {
        for (uint256 i; i < numNFTs.length; ) {
            nftContract.safeTransferFrom(address(this), sender, numNFTs[i]);
            unchecked {
                i++;
            }
        }
    }

    function sendTokens(
        address _from,
        uint256 amount,
        address _to,
        IERC20 token
    ) internal {
        if (_from == address(this)) {
            token.transfer(_to, amount);
        } else {
            token.transferFrom(_from, _to, amount);
        }
    }

    function _sendNFTsToContract(
        address _from,
        uint256[] memory nftID,
        IERC721 nftContract
    ) internal {
        for (uint256 i; i < nftID.length; ) {
            nftContract.safeTransferFrom(_from, address(this), nftID[i]);
            unchecked {
                i++;
            }
        }
    }
}
