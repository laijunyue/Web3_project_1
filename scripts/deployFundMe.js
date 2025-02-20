//合约部署
//import ethers.js
//create main function
//excute main function

//init 2 accounts   
//fund to contract by first account 
//check contract balance
//fund to contract by second account 
//check contract balance
//check mapping fundersToAmount

const{ ethers } = require("hardhat");
async function main(){  //异步函数
    //deploy contract
    //const [owner, randomPerson] = await ethers.getSigners();
    //create factory
    const FundMeFactory = await ethers.getContractFactory("FundMe");
    console.log("Deploying factory ");
    //deploy contract from factory
    const fundMe = await FundMeFactory.deploy(300);
    await fundMe.waitForDeployment();
    console.log("Contract is finished, FundMe contract address:", fundMe.target);

    //verify FundMe contract
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        console.log("Waiting for 5 confirmations")
        await fundMe.deploymentTransaction().wait(5)
        verifyFundMe(fundMe.target, [300])
    } else {
        console.log("verification skipped..")
    }

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

}

async function verifyFundMe(fundMeAddr, args){
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}
                    //input      ///function body
main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})