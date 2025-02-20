const { task } = require("hardhat/config");

task("interact-fundme", "interact fundMe constract").addParam("addr", "fundMe contract address").setAction(async(taskArgs, hre) => {

    const FundMeFactory = await ethers.getContractFactory("FundMe")  //get contract
    const fundMe = FundMeFactory.attach(taskArgs.addr)  //attach contract

    //init 2 accounts   
    const [firstAccount, secondAccount] = await ethers.getSigners()   //get account
    console.log("First account:", firstAccount.address)
    console.log("Second account:", secondAccount.address)

    //fund to contract by first account 
    const fundTs =  await fundMe.fund({value: ethers.parseEther("0.000001")})
    await fundTs.wait()
    
    //check contract balance
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`Contract balance: ${balanceOfContract}`)

    //fund to contract by second account 
    const fundTsWithSecondAccount =  await fundMe.connect(secondAccount).fund({value: ethers.parseEther("0.000001")})
    await fundTsWithSecondAccount.wait()

    //check contract balance
    const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target)
    console.log(`Contract balance: ${balanceOfContractAfterSecondFund}`)

    //check mapping fundersToAmount
    console.log("Mapping fundersToAmount:")
    const firstAccountbalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address)
    console.log(`First account: ${firstAccountbalanceInFundMe}`)
    const secondAccountbalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`Second account: ${secondAccountbalanceInFundMe}`)
})

module.exports = {}