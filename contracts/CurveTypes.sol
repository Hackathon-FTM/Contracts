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
            uint256 protocolFee,
            uint poolFee
        )

        {
           if(numItems == 0) {
            return(0,0,0, 0);
           }

            if(isLinear) {
               uint newSpot = (delta * numItems) + spotPrice;
               uint calculation = newSpot;
               uint _protocolFee = (calculation * protocolFeeMultiplier) / 100;
               uint userFee = (calculation * feeMultiplier) / 100;
               inputValue = calculation + userFee + _protocolFee;
               protocolFee = _protocolFee;
               newSpotPrice = newSpot;
            } else {
                uint expoCalculation = spotPrice * (1e18 + delta) ** numItems;
                newSpotPrice = expoCalculation;
                uint _protocolFee = (expoCalculation * protocolFeeMultiplier) / 100;
               uint userFee = (expoCalculation * feeMultiplier) / 100;
                inputValue = expoCalculation + userFee + _protocolFee;
                protocolFee = _protocolFee;
                poolFee = userFee;
     }

        }
}