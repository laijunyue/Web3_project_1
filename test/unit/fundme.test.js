const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {developmentChains} = require("../../mock-hardhat-config")

!developmentChains.includes(network.name)
? describe.skip
: describe("test fundme contract", async function(){
    let fundMe
    let fundMeSecondAccount
    let firstAccount
    let secondAccount
    let mockV3Aggregator
    beforeEach(async function() {
        await deployments.fixture(["all"])     //deploy all the contracts which tag is all
        firstAccount = (await getNamedAccounts()).firstAccount
        secondAccount = (await getNamedAccounts()).secondAccount
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
    })

    it("test if the owner is msg.sender", async function(){
        // const [firstAccount] = await ethers.getSigners()

        // const fundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe =await fundMeFactory.deploy(180)  //send success
        await fundMe.waitForDeployment()   //deploy success

        assert.equal((await fundMe.owner()), firstAccount)

    })

    it("test if the datafeed is assigned correctly", async function(){
        await fundMe.waitForDeployment()
        assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address)
    })


    //fund getFund reFund

    //unit test for fund
    //1. window open at time ; 2. fund value is greater than minimum fund value
    it("Window closed, fund value is greater then minimum value, fund failed", 
        async function(){
            //make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()
            
            //make sure fund value is greater than minimum fund value
            expect(fundMe.fund({value: ethers.parseEther("0.01")}))
                .to.be.revertedWith("Timeout!, window is closed!")

        }
    )
    it("Window open, fund value is less then minimum value, fund failed", 
        async function(){
            //make sure fund value is less than minimum fund value
            expect(fundMe.fund({value: ethers.parseEther("0.000001")}))
                .to.be.revertedWith("Send more ETH")
        }
    )
    //success
    it("Window open, fund value is greater then minimum value, fund success", 
        async function(){
            //make sure fund value is greater than minimum fund value
            await expect(fundMe.fund({value: ethers.parseEther("0.01")}))

            const balance = await fundMe.funderToAmount(firstAccount)
            assert.equal(balance, ethers.parseEther("0.01"))
        }
    )

    //Unit test for getFund
    //onlyOwner, windowClosed, target reached
    it("Not owner, windowClosed, target reached, getFund failed", async function(){
        //make sure the target is reached
        await fundMe.fund({value: ethers.parseEther("0.1")})

        //make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()
        
        //make sure only owner can call getFund
        await expect(fundMeSecondAccount.getFund())
            .to.be.revertedWith("This function can only be called by owner!")

    })
    it("Is Owner, windowOpen, target reached, getFund failed", async function(){
        //make sure the target is reached
        await fundMe.fund({value: ethers.parseEther("0.1")})
        
        await expect(fundMe.getFund())
            .to.be.revertedWith("It is not the right time yet!")
    }) 
    it("Is owner, windowClosed, target not reached, getFund failed", async function(){
        //make sure the target is not reached
        await fundMe.fund({value: ethers.parseEther("0.01")})

        //make sure the window is closed
        await helpers.time.increase(200)
        await helpers.mine()

        //make sure only owner can call getFund
        expect(fundMe.getFund())
            .to.be.revertedWith("Target is not enough!")

    })
    it("Is owner, window closed, target reached, getFund success", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()   
            await expect(fundMe.getFund())
                .to.emit(fundMe, "FundWithdrawByOwner")
                .withArgs(ethers.parseEther("0.11"))
        }
    )

    // refund
    // windowClosed, target not reached, funder has balance
    it("window open, target not reached, funder has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.01")})
            await expect(fundMe.reFund())
                .to.be.revertedWith("It is not the right time yet!");
        }
    )

    it("window closed, target reach, funder has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.1")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()  
            await expect(fundMe.reFund())
                .to.be.revertedWith("Target is enough!");
        }
    )

    it("window closed, target not reach, funder does not has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.01")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()  
            await expect(fundMeSecondAccount.reFund())
                .to.be.revertedWith("There is no fund for you!");
        }
    )

    it("window closed, target not reached, funder has balance", 
        async function() {
            await fundMe.fund({value: ethers.parseEther("0.01")})
            // make sure the window is closed
            await helpers.time.increase(200)
            await helpers.mine()  
            await expect(fundMe.reFund())
                .to.emit(fundMe, "RefundByFunder")
                .withArgs(firstAccount, ethers.parseEther("0.01"))
        }
    )
    
})