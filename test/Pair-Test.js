const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";


describe("PAIR", function () {
it("Deploy PAIR & Initialize", async () => {
  const DAI = await ethers.getContractFactory("DAI");
  const Curve = await ethers.getContractFactory("CurveTypes");
  const PS_PAIR = await ethers.getContractFactory("PS_PAIRV1");
  const curve = await Curve.deploy();
  const dai = await DAI.deploy();
  const pairContract = await PS_PAIR.deploy();
  await pairContract.initialize(
   0,
   0,
   0,
   ZERO_ADDRESS,
   dai.address,
   ZERO_ADDRESS,
   curve.address,
   0,
   [0],
   true
  )
})

});
