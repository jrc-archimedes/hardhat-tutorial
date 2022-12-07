const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Token contract", function () {
    
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const tokenFactory = await ethers.getContractFactory("Token");
        const tokenContract = await tokenFactory.deploy();
        await tokenContract.deployed();
        
        // Fixtures can return anything you consider useful for your tests
        return { tokenFactory, tokenContract, owner, addr1, addr2 };
    }

    it("Deployment should assign the total supply of tokens to the owner", async function () {
        const { tokenContract, owner } = await loadFixture(deployTokenFixture);
        
        const ownerBalance = await tokenContract.balanceOf(owner.address);
        const totalSupply = await tokenContract.totalSupply();
        expect(totalSupply).to.equal(ownerBalance);
    });

    it("Symbol should have be MHT", async function () {
        const { tokenContract } = await loadFixture(deployTokenFixture);
       
        const symbol = await tokenContract.symbol();
        expect(symbol).to.equal("MHT");
    });

    it("Should transfer tokens between accounts", async function () {
        const { tokenContract, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);

        // Transfer 99 tokens from owner to addr1
        await expect(
            tokenContract.transfer(addr1.address, 99)
        ).to.changeTokenBalances(
            tokenContract, [owner, addr1], [-99, 99]
        );

        // Transfer 12 tokens from addr1 to addr2
        await tokenContract.connect(addr1).transfer(addr2.address, 12);
        const balance2 = await tokenContract.balanceOf(addr2.address);
        expect(balance2).to.equal(12);
        expect(await tokenContract.balanceOf(addr1.address)).to.equal(87);
    });

});