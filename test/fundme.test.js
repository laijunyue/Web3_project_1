const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")

describe("test fundme contract", async function(){
    let firstAccount
    let fundMe
    beforeEach(async function(){
        await deployments.fixture(["all"])    //deploy all the contracts which tag is all
        firstAccount = (await getNamedAccounts()).firstAccount
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
    })

    it("test if the owner is msg.sender", async function(){
        // const [firstAccount] = await ethers.getSigners()

        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe =await fundMeFactory.deploy(180)  //send success
        await fundMe.waitForDeployment()   //deploy success

        assert.equal((await fundMe.owner()), firstAccount)

    })

})