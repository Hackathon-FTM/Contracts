const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const mintTokens = ethers.utils.parseEther("10000");

describe("PAIR-SNFTs", function () {

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
    })
    it("Init Contract", async () => {
        const spotPrice = ethers.utils.parseEther("0.05");
        const _delta = ethers.utils.parseEther("0.01");
        const [owner, addr1, addr2] = await ethers.getSigners();

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
    }),

    it("Test Swap Specific NFTs -- Linear Model", async () => {
        const spotPrice = ethers.utils.parseEther("0.05");
        const _delta = 100;
        const [owner, addr1, addr2] = await ethers.getSigners();
        const maxAmount = ethers.utils.parseEther("0.2");


        await pairContract.initialize(
            0,
            spotPrice,
            100, // 10%
            nft.address,
            dai.address,
            addr2.address, // Works as Router for now
            curve.address,
            owner.address,
            mintTokens,
            [0, 1, 2],
            true
          );
          await dai.connect(addr1).mint(mintTokens);
          await dai.connect(addr1).approve(pairContract.address, mintTokens);

        await pairContract.connect(addr1).swapTokensForSpecificNFTs(
            [1, 2],
            maxAmount,
            false,
            ZERO_ADDRESS
        );
        expect(await nft.ownerOf(1)).to.equal(addr1.address);
        expect(await nft.ownerOf(2)).to.equal(addr1.address);
        const balanceNFTs_SC = await nft.balanceOf(pairContract.address);

        expect(balanceNFTs_SC).to.equal(1);

        const before = await dai.balanceOf(addr2.address);
        const beforeO = await dai.balanceOf(owner.address);
        const bSender = await dai.balanceOf(addr1.address);

        await pairContract.connect(addr1).swapTokensForSpecificNFTs(
            [0],
          maxAmount,
            false,
            ZERO_ADDRESS
        );

        const aSender = await dai.balanceOf(addr1.address);
        const afterO = await dai.balanceOf(owner.address);
        const after = await dai.balanceOf(addr2.address);

        console.log(((bSender - aSender) / 10 ** 18), "Total Value for 2 NFTs + Fees ")
        console.log((afterO - beforeO) / 10 ** 18, "Owner FEE");
        console.log((after - before) / 10 ** 18, "PROTOCOL FEE");

    })
})