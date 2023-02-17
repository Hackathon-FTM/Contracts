
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  
  require("chai")
.use(require("chai-as-promised"))
.should()

  
  describe("CURVE", function () {
  it("Deploy Curve & Test Basic Engine", async () => {
    const Curve = await ethers.getContractFactory("CurveTypes");
    const curve = await Curve.deploy();
   expect( await curve.validateSpotPrice(
    0,
    false
)).to.equal(false);
expect( await curve.validateSpotPrice(
    2,
    false
)).to.equal(true);
    expect( await curve.validateSpotPrice(
    0,
    true
)).to.equal(true);

expect(await curve.validateDelta(
    0,
    true
    )).to.equal(true);
expect(await curve.validateDelta(
    0,
    false
)).to.equal(false);

  }),

  it("Testing getBuyInfo - Linear", async () => {
    const Curve = await ethers.getContractFactory("CurveTypes");
    const curve = await Curve.deploy();
    const spotPrice = ethers.utils.parseEther("0.3");
    const delta = ethers.utils.parseEther("0.05");
    const tx = await curve.getBuyInfo(
        spotPrice,
        delta,
        3,
        1 /* 1 --> 0.1% */,
        1,
        true
    );
    expect(parseFloat(tx.inputValue)).to.equal(((parseFloat(spotPrice * 3) + parseFloat( delta * 3)) )* 1.002);

    const second_tx = await curve.getBuyInfo(
        spotPrice,
        delta,
        3,
        0,
        1,
        true
    );
    expect(second_tx.poolFee).to.equal(0);
  

    const third_tx = await curve.getBuyInfo(
        spotPrice,
        delta,
        0,
        0,
        1,
        true
    );
    expect(third_tx.protocolFee).to.equal(0);

  }),

  it("Testing getBuyInfo - Expo", async () => {
    const Curve = await ethers.getContractFactory("CurveTypes");
    const curve = await Curve.deploy();
    const spotPrice = ethers.utils.parseEther("0.3");
    const delta = 10; // 10 / 1000 --> 1%
    const tx = await curve.getBuyInfo(
       `${spotPrice}`,
       `${delta}`,
       5,
       10,
       5,
       false
    );
   expect(tx.newSpotPrice / 10 ** 18).to.equal(0.3 * (1 + 0.01) ** 5);

   let lastSpot = spotPrice;
   let minAmount = 0;
   for(let i = 0; i < 5; i++) {
    lastSpot = lastSpot * ((1 + 0.01));
     minAmount += lastSpot;
   }

   expect(parseFloat(tx.inputValue))
   .to.equal(
    parseFloat(minAmount) + parseFloat(minAmount * 0.005) + parseFloat(minAmount * 0.01)
   );

    expect(parseFloat(tx.poolFee)).to.equal(parseFloat(minAmount * 0.01) - 2 )
   
  })



  });
  