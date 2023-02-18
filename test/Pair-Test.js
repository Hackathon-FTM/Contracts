const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const RANDOM_WALLET = "0x762489AcEc5B710dC159525467e8fe1c0F8E7088";

const mintTokens = ethers.utils.parseEther("10000");

describe("PAIR",  function () {

let DAI;
let dai;
let NFT;
let nft;
let Curve;
let curve;
let PS_PAIR;
let pairContract;

  beforeEach(async () => {
    const [owner, addr1, addr2] = await ethers.getSigners();
     DAI = await ethers.getContractFactory("DAI");
     dai = await DAI.deploy();
     NFT = await ethers.getContractFactory("TestNFT");
     nft = await NFT.deploy();
     Curve = await ethers.getContractFactory("CurveTypes");
     curve = await Curve.deploy();
     PS_PAIR = await ethers.getContractFactory("PS_PAIRV1");      
     pairContract = await PS_PAIR.deploy();

     // MINT NFTS
  await nft.mint();
  await nft.mint();
  await nft.mint();
  await nft.setApprovalForAll(pairContract.address, true);

  // MINT TOKENS
  await dai.mint(mintTokens);
  await dai.approve(pairContract.address, mintTokens);


 }),
it("Deploy PAIR & Initialize", async () => {
  const [owner, addr1, addr2] = await ethers.getSigners();

  // MINT NFTS
  await nft.mint();
  await nft.mint();
  await nft.mint();
  await nft.setApprovalForAll(pairContract.address, true);

  // MINT TOKENS
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
   addr2.address, // Works as Router for now
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


}),

it("Swap tokens for any NFTs - Linear Model", async () => {
  const [owner, addr1, addr2] = await ethers.getSigners();
  // INIT
  const spotPrice = ethers.utils.parseEther("0.05");
  const _delta = ethers.utils.parseEther("0.01");

  await pairContract.initialize(
   7,
   spotPrice,
   _delta,
   nft.address,
   dai.address,
   addr2.address,
   curve.address,
   owner.address,
   mintTokens,
   [0, 1, 2],
   true
  );
  await dai.connect(addr1).mint(mintTokens);
  const maxAmount = ethers.utils.parseEther("0.15");
  await dai.connect(addr1).approve(pairContract.address, mintTokens);
  const before = await dai.balanceOf(addr2.address);
  const beforeO = await dai.balanceOf(owner.address);
  const bSender = await dai.balanceOf(addr1.address);
  await pairContract.connect(addr1).swapTokensForAnyNFTs(
   2,
   maxAmount,
   false,
   ZERO_ADDRESS
  );
  const aSender = await dai.balanceOf(addr1.address);
  const afterO = await dai.balanceOf(owner.address);
  const after = await dai.balanceOf(addr2.address);
  
  const balanceNFTs_USER = await nft.balanceOf(addr1.address);
  const balanceNFTs_SC = await nft.balanceOf(pairContract.address);

  console.log(((bSender - aSender) / 10 ** 18), "Total Value for 2 NFTs + Fees ")
  console.log((afterO - beforeO) / 10 ** 18, "Owner FEE");
  console.log((after - before) / 10 ** 18, "PROTOCOL FEE");
  expect(balanceNFTs_USER).to.equal(2);
  expect(balanceNFTs_SC).to.equal(1);

  const s_MaxAmount = ethers.utils.parseEther("0.09");

  await pairContract.connect(addr1).swapTokensForAnyNFTs(
    1,
    s_MaxAmount,
    false,
    ZERO_ADDRESS
   );


}),

it("Swap tokens for any NFTs - Expo Model", async () => {

  const [owner, addr1, addr2] = await ethers.getSigners();
  const spotPrice = ethers.utils.parseEther("0.05");
  const maxAmount = ethers.utils.parseEther("0.65");




  await pairContract.initialize(
    7,
    spotPrice,
    120, // 12%
    nft.address,
    dai.address,
    addr2.address,
    curve.address,
    owner.address,
    mintTokens,
    [0, 1, 2],
    false
   ); 
   await dai.connect(addr1).mint(mintTokens);
   await dai.connect(addr1).approve(pairContract.address, mintTokens);

   const before = await dai.balanceOf(addr2.address);
   const beforeO = await dai.balanceOf(owner.address);
   const bSender = await dai.balanceOf(addr1.address);

await pairContract.connect(addr1).swapTokensForAnyNFTs(
  2,
  maxAmount,
  false,
  ZERO_ADDRESS
)
const aSender = await dai.balanceOf(addr1.address);
const afterO = await dai.balanceOf(owner.address);
const after = await dai.balanceOf(addr2.address);
const balanceNFTs_USER = await nft.balanceOf(addr1.address);
const balanceNFTs_SC = await nft.balanceOf(pairContract.address);

console.log(((bSender - aSender) / 10 ** 18), "Total Value for 2 NFTs + Fees ")
console.log((afterO - beforeO) / 10 ** 18, "Owner FEE");
console.log((after - before) / 10 ** 18, "PROTOCOL FEE");
expect(balanceNFTs_USER).to.equal(2);
expect(balanceNFTs_SC).to.equal(1);

const s_MaxAmount = ethers.utils.parseEther("0.09");

await pairContract.connect(addr1).swapTokensForAnyNFTs(
  1,
  s_MaxAmount,
  false,
  ZERO_ADDRESS
 );


})





});
