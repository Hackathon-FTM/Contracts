const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  
  const mintTokens = ethers.utils.parseEther("10000");
  
  describe("PAIR", function () {
  
    let DAI;
    let dai;
    let NFT;
    let nft;
    let Curve;
    let curve;
    let PS_PAIR;
    let pairContract;
  
    beforeEach(async () => {
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
        it("Selling NFTs For Tokens -- Linear Model", async () => {
            const [owner, addr1, addr2] = await ethers.getSigners();

            const spotPrice = ethers.utils.parseEther("0.3");
            const _delta = ethers.utils.parseEther("0.01");
      
            const liquidity = ethers.utils.parseEther("1");
            await pairContract.initialize(
              0,
              spotPrice,
              _delta,
              nft.address,
              dai.address,
              addr2.address, // Works as Router for now
              curve.address,
              owner.address,
              liquidity,
              [0, 1, 2],
              true
            );

            const minValue = ethers.utils.parseEther("0.27");
            await nft.connect(addr1).mint();
            await nft.connect(addr1).approve(pairContract.address, 3)
            const balanceBefore = await dai.balanceOf(addr1.address);

            await pairContract.connect(addr1).swapNFTsForTokens(
                [3],
               [ [
                  '0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5',
                  '0x0b4aa17bff8fc189efb37609ac5ea9fca0df4c834a6fbac74b24c8119c40fef2',
                  '0x3235290a71c29b8c01eeb9f16e5cce045aa813fcef791814806e2ff11feb519f',
                  '0x3ceb0f2fe15be2a24edac38d32e1b42c55e20e749e1dc6cb8413e88a34c9be63'
                ]],
                minValue,
                false,
                ZERO_ADDRESS
            );
            const balanceAfter = await dai.balanceOf(addr1.address);
            console.log((balanceAfter - balanceBefore) / 10 ** 18);
        
     
    }),

    it("Selling NFTs For Tokens -- Expo Model", async () => {

        const [owner, addr1, addr2] = await ethers.getSigners();

        const spotPrice = ethers.utils.parseEther("0.3");
        const liquidity = ethers.utils.parseEther("1");
        const _delta = 100; // 100 --> 10%
        await pairContract.initialize(
          0,
          spotPrice,
          _delta,
          nft.address,
          dai.address,
          addr2.address, // Works as Router for now
          curve.address,
          owner.address,
          liquidity,
          [0, 1, 2],
          false
        );

        await nft.connect(addr1).mint();
        await nft.connect(addr1).mint();
        await nft.connect(addr1).approve(pairContract.address, 3)
        await nft.connect(addr1).approve(pairContract.address, 4)
        const balanceBefore = await dai.balanceOf(addr1.address);
        const minValue = ethers.utils.parseEther("0.26");

        await pairContract.connect(addr1).swapNFTsForTokens(
            [3, 4],
            [[
              '0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5',
              '0x0b4aa17bff8fc189efb37609ac5ea9fca0df4c834a6fbac74b24c8119c40fef2',
              '0x3235290a71c29b8c01eeb9f16e5cce045aa813fcef791814806e2ff11feb519f',
              '0x3ceb0f2fe15be2a24edac38d32e1b42c55e20e749e1dc6cb8413e88a34c9be63'
            ], [
              '0xceebf77a833b30520287ddd9478ff51abbdffa30aa90a8d655dba0e8a79ce0c1',
              '0x6d7746a0c24e6f9bd5f5b81b97fcf98054c1b5dddc2a8e329389759e8a7f91e1',
              '0xaa9e8275107be9f8089f326bcaaa568367efd2d253eed8cc411711f371c7caeb',
              '0x3ceb0f2fe15be2a24edac38d32e1b42c55e20e749e1dc6cb8413e88a34c9be63'
            ]],
            minValue,
            false,
            ZERO_ADDRESS  
                 );
        const balanceAfter = await dai.balanceOf(addr1.address);
        console.log(((balanceAfter - balanceBefore) / 10 ** 18) - 0.27); 
    })

  })