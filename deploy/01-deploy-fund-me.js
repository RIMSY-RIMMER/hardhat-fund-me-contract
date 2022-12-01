// vytáhnutí networkConfigu ze souboru: "../helper-hardhat-config"
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // podmínka priceFeed vs chain ID
    // price feed adresa se rovná networkConfig s chainID
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    // let --> aby mohlo být updatováno
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        // podmínka: pokud nejsme na development chainu, tak:
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    // if the contract doesn't exist, we deploy a minimal version of it
    // for our local testing, deloying mock = deploy skript

    // chains change ??
    // when going to localhost or hardhat we wanr to use mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // tady bude priceFeed adresa
        log: true, // custom loging, jako console.log
        waitConfirmations: network.config.blockConfirmations || 1 // pokud jsme nedostali konfirmaci, počkej 1 blok
    })

    // verifikace kodu
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHESCAN_API_KEY
    ) {
        // then verify
        // list of arguments --> abychom to udělali jednudušší, uděláme const args
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
