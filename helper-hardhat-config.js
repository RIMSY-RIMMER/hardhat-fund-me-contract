const networkConfig = {
    31337: {
        name: "localhost"
    },

    1337: {
        name: "LocalGanache"
    },
    // Goerli chain ID: 5
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    }
}

const developmentChains = ["hardhat", "localhost", "LocalGanache"]
// dole potřebujeme exportovat networkConfig skript
// aby s ním mohli pracovat ostatní skripty
// poté ho importujeme do deploy skriptu
module.exports = {
    networkConfig,
    developmentChains
}
