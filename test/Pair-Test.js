const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const RANDOM_WALLET = "0x762489AcEc5B710dC159525467e8fe1c0F8E7088";


describe("PAIR", function () {
it("Deploy PAIR & Initialize", async () => {
  const [owner, addr1, addr2] = await ethers.getSigners();
  const DAI = await ethers.getContractFactory("DAI");
  const Curve = await ethers.getContractFactory("CurveTypes");
  const PS_PAIR = await ethers.getContractFactory("PS_PAIRV1");
  const NFT = await ethers.getContractFactory("TestNFT");
  const nft = await NFT.deploy();
  const curve = await Curve.deploy();
  const dai = await DAI.deploy();
  const pairContract = await PS_PAIR.deploy();

  // MINT NFTS
  await nft.mint();
  await nft.mint();
  await nft.mint();
  await nft.setApprovalForAll(pairContract.address, true);

  // MINT TOKENS
  const mintTokens = ethers.utils.parseEther("10000");
  await dai.mint(mintTokens);
  await dai.approve(pairContract.address, mintTokens);


  // INIT
  const spotPrice = ethers.utils.parseEther("0.05");
  const _delta = ethers.utils.parseEther("0.01");

  await pairContract.initialize(
   0,
   spotPrice,
   _delta,
   nft.address,
   dai.address,
   ZERO_ADDRESS,
   curve.address,
   owner.address,
   mintTokens,
   [0, 1, 2],
   true
  )

  expect(
    await nft.balanceOf(pairContract.address)
    ).to.equal(3);
  expect(
    await dai.balanceOf(pairContract.address)
  ).to.equal(mintTokens);
});




});
