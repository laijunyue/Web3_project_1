const { getNamedAccounts } = require("hardhat");
const { developmentChains, DECIMAL, INITIAL_PRICE } = require("../mock-hardhat-config");

module.exports = async({getNamedAccounts, deployments}) =>{
    // const firstAccount = (await getNamedAccounts()).firstAccount;
    const {firstAccount} = await getNamedAccounts();
    console.log(`First account: ${firstAccount}`);

    if(/*local*/developmentChains.includes(network.name)){
        const {firstAccount} = await getNamedAccounts();
        const {deploy} = deployments;

        await deploy("MockV3Aggregator", {
        from: firstAccount,
        args: [DECIMAL, INITIAL_PRICE],
        log: true,
    });
    }else{
        console.log("Environment is not local, mock constract is skipped...");
    }
    
}

module.exports.tags = ["all", "mock"];
