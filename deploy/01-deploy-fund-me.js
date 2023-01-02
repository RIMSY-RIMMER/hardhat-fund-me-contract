// vytáhnutí networkConfigu ze souboru: "../helper-hardhat-config"
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (chainId == 31337 || 1337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // tady bude priceFeed adresa
        log: true, // custom loging, jako console.log
        waitConfirmations: network.config.blockConfirmations || 1
    })

    // code for verification
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHESCAN_API_KEY
    ) {
        // then verify
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
