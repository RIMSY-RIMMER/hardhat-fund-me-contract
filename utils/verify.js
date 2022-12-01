// protože používáme run command
const { run } = require("hardhat")

// verify funkce
const verify = async (contractAdress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAdress,
            constructorArguments: args
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
