const { network } = require("hardhat")

const DECIMALS = "8"
const INITIAL_PRICE = "200000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // podmínka, že nechceme deloynout moct kontrakt na testnet, který už v sobě má priceFeed
    // definujeme si development chainy
    // protože helper config používá jmnéna (hardhat, local host) a ne chainID
    if (chainId == 31337 || 1337) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            // argumenty, contructor parameters pro V3Aggregator --> node modules
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks deployed!")
        log("----------------------------------------------")
    }
}

// cesta jak rozběhnout pouze deploy mock skript
// a když chceme rozběhnout   <-- přidáme tags
module.exports.tags = ["all", "mocks"]
