pragma solidity ^0.8.0;

contract CurveTypes {

function validateDelta(uint delta, bool isLinear) external pure returns (bool valid) {
    if(isLinear) {
     return delta >= 0 ?  true : false;
    } else {
        return delta > 1 ? true : false;
    }
}

   function validateSpotPrice(uint newSpotPrice, bool isLinear)
        external
        pure
        returns (bool valid) {
             if(isLinear) {
             return true;
           } else {
          return newSpotPrice >= 1 ? true : false;
        }
        }


   function getBuyInfo(
        uint spotPrice,
        uint delta,
        uint256 numItems,
        uint256 feeMultiplier,
        uint256 protocolFeeMultiplier,
        bool isLinear
    )
        external
        pure
        returns (
            uint newSpotPrice,
            uint256 inputValue,
            uint poolFee,
            uint256 protocolFee

        )

        {
           if(numItems == 0) {
            return(0,0,0, 0);
           }

            if(isLinear) {
               uint newSpot = (delta * numItems) + spotPrice;
               uint calculation = newSpot;
               uint _protocolFee = (calculation * protocolFeeMultiplier) / 1000;
               uint userFee = (calculation * feeMultiplier) / 1000;
               inputValue = calculation + userFee + _protocolFee;
               protocolFee = _protocolFee;
               newSpotPrice = newSpot;
               poolFee = userFee;
            } else {

               uint lastSpot = spotPrice;
             for(uint i; i < numItems; i++) {

                 lastSpot = ( lastSpot * (1000 + delta)) / 1000;

             }
                newSpotPrice = lastSpot;
                uint _protocolFee = (lastSpot * protocolFeeMultiplier) / 1000;
               uint userFee = (lastSpot * feeMultiplier) / 1000;
                inputValue = lastSpot + userFee + _protocolFee;
                protocolFee = _protocolFee;
                poolFee = userFee;
     }

        }
}