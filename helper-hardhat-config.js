const networkConfig = {
    31337: {
        name: "localhost"
    },

    1337: {
        name: "LocalGanache"
    },

    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    }
}

const developmentChains = ["hardhat", "localhost", "LocalGanache"]

module.exports = {
    networkConfig,
    developmentChains
}
