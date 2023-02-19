

const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  
  require("chai")
.use(require("chai-as-promised"))
.should()

  
  describe("CURVE", function () {

it("Testing getBuyInfo - Linear", async () => {
    const Curve = await ethers.getContractFactory("CurveTypes");
    const curve = await Curve.deploy();
    const spotPrice = ethers.utils.parseEther("0.3");
    const delta = ethers.utils.parseEther("0.05");

   const tx = await curve.getSellInfo(
        spotPrice,
        delta,
        3,
        10,
        10,
        true
    );

    const otherTx = await curve.getSellInfo(
        tx.newSpotPrice,
        delta,
        1,
        10,
        10,
        true
    );
    console.log(tx.newSpotPrice / 10 ** 18, "First New Spot");
    console.log(tx.sellPrice / 10 ** 18, "First Sell Price");
    console.log(otherTx.poolFee / 10 ** 18, "Pool Fee Second Tx");
    console.log(otherTx.sellPrice / 10 ** 18, "Sell Price Second Tx");
   
}),

it("Testing getBuyInfo - Expo Model", async () => {
    const Curve = await ethers.getContractFactory("CurveTypes");
    const curve = await Curve.deploy();
    const spotPrice = ethers.utils.parseEther("0.3");
    const delta = 100;

    const tx = await curve.getSellInfo(
        spotPrice,
        delta,
        3,
        10,
        10,
        false
    );
   console.log(tx.newSpotPrice / 10 ** 18, "First New Spot -- Expo");
    console.log(tx.sellPrice / 10 ** 18, "First Sell Price -- Expo");
})
  });