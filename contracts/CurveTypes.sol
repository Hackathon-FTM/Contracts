pragma solidity ^0.8.0;

contract CurveTypes {

function validateDelta(uint128 delta, bool isLinear) external pure returns (bool valid) {
    if(isLinear) {
     return delta >= 0 ?  true : false;
    } else {
        return delta > 1 ? true : false;
    }
}

   function validateSpotPrice(uint128 newSpotPrice, bool isLinear)
        external
        pure
        returns (bool valid) {
             if(isLinear) {
             return true;
           } else {
          return newSpotPrice >= 1 ? true : false;
        }
        }

}