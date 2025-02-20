const { task } = require("hardhat/config");

task("deploy-fundme", "deploy and verify fundMe constract").setAction(async(taskArgs, hre) => {
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
})

async function verifyFundMe(fundMeAddr, args){
    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: args,
      });
}

module.exports = {}