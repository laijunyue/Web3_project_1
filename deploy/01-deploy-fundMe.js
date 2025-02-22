const { getNamedAccounts, network } = require("hardhat");
const { developmentChains, networkConfig, LOCK_TIME, CONFIRMATIONS } = require("../mock-hardhat-config");
// function deployFunction(){
//     console.log("This is a deploy function");
// }

// module.exports.default = deployFunction;

// module.exports.default = async(hre) =>{
//     const getNamedAccounts = hre.getNamedAccounts;
//     const deployments = hre.deployments;

//     console.log("This is a deploy function");
// }

module.exports = async({getNamedAccounts, deployments}) =>{
    // const firstAccount = (await getNamedAccounts()).firstAccount;
    const {firstAccount} = await getNamedAccounts();
    console.log(`First account: ${firstAccount}`);

    const {deploy} = deployments;

    let dataFeedAddr;
    let confirmations;
    if(/*local*/developmentChains.includes(network.name)){
        const mockDataFeed = await deployments.get("MockV3Aggregator");
        dataFeedAddr = mockDataFeed.address;
        confirmations = 0;
    }else{
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        confirmations = confirmations;
    }

    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations,
    });

    //remove deployments directoryyor or add --reset flag if you redeploy contract
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME, dataFeedAddr],
        });
    }else{
        console.log("This network is not sepolia, mock constract is skipped...");
    }
    
}

module.exports.tags = ["all", "fundme"];