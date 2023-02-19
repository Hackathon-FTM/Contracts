const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const RANDOM_WALLET = "0x762489AcEc5B710dC159525467e8fe1c0F8E7088";

describe("NFT", () => {

  it("Deploy NFT contract", async () => {
    const NFT = await ethers.getContractFactory("TestNFT");
    const [owner, addr1, addr2] = await ethers.getSigners();
    const nftContract = await NFT.deploy();
    await nftContract.mint();
    await nftContract.mint();
    await nftContract.mint();
    await nftContract.connect(addr1).mint();
    const tx = await nftContract.tokenOfOwnerByIndex(owner.address, 1);
    const second_tx = await nftContract.tokenOfOwnerByIndex(addr1.address, 0);
    expect(tx).to.equal(1);
    expect(second_tx).to.equal(3);

  })
})