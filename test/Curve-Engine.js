
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
    expect(tx.poolFee).to.equal(tx.newSpotPrice / 1000);

    const second_tx = await curve.getBuyInfo(
        spotPrice,
        delta,
        3,
        0,
        1,
        true
    );
    expect(second_tx.poolFee).to.equal(0);
    expect(second_tx.protocolFee).to.equal(tx.newSpotPrice * 0.001);

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

    expect(tx.protocolFee).to.equal((tx.newSpotPrice) * 0.005);

    expect(tx.poolFee).to.equal((tx.newSpotPrice) * 0.01)
  })



  });
  