require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("hardhat-deploy")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")

/** @type import('hardhat/config').HardhatUserConfig */

const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL ||
    "https://eth-goerli.alchemyapi.io/v2/your-api-key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

module.exports = {
    // solidity: "0.8.8",
    // solidity object
    solidity: {
        // list compilerů
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6
        },

        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337
        }
    },

    namedAccounts: {
        deployer: {
            default: 0 // // here this will by default take the first account as deployer
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD"
        // coinmarketcap: COINMARKETCAP_API_KEY
    }
}
