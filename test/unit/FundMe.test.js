// importujeme deployments objects, deployment object function: fixture
const { deployments, ethers, getNamedAccounts } = require("hardhat")
// chai is being overwritten by waffle
const { assert, expect } = require("chai")

// hlavní describe je pro celej FundMe kontrakt
describe("FundMe", async function() {
    // nejdříve deployneme FundMe kontrakt
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") // 1 ETH = 1 a 18 nul
    beforeEach(async function() {
        // FundMe using harhat deploy
        // fixture - můžeme rozjet deploy folder se všema tagama
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        // dá nám poslední verzi FundMe, kterou jsme deploynuli
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    // všechno uvnitř těchto bude pro jednotlivé funkce: Constructor
    describe("constructor", function() {
        it("sets the aggregator addresses correctly", async () => {
            // priceFee = MockV3Aggregator, protože budeme testovat lokálně
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    // test pro funkci fund
    describe("fund", async function() {
        // první bude test require statementu, jestli kontrakt falne, pokud nebylo posláno dostatek ETH
        it("Fails if you don't send enough ETH", async function() {
            // použijeme waffle testing, díky waffle můžeme použít expect keyword
            // and ecxpect transaction to be reverted and fail
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        // test správně updatnuté - getAddressToAmountFunded
        it("updated the amount funded data structure", async function() {
            // tad musíme zavolat fundMe.fund(), zadáme natvrdo hodnotu
            await fundMe.fund({ value: sendValue })
            // sezname adres (mapping), které fundovali
            // pokud použijeme deployer.address, mělo by nám to dát hodnotu, kterou jsme poslali
            const response = await fundMe.getAddressToAmountFunded(deployer)
            // response - kolik bylo funded a to by mělo být stejné jako sendValue
            assert.equal(response.toString(), sendValue.toString())
        })
        // fund dunkce - přidávání getFunder do getFunder array
        it("Adds funder to array of getFunder", async function() {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })
    // test withdraw funkce
    describe("withdraw", async function() {
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function() {
            // Arrange
            // starting balanc of fundme:
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            // starting balance of deployer
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            // vytáhnutí gasu {} <-- cesta jak vytahnout object z jineho objectu
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            // celkový gas:
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                // +
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                // aby se rovnalu musíme ještě přidat gasCost
                endingDeployerBalance.add(gasCost).toString()
            )
        })
        // wathdraw ETH with multiple founders
        it("alows us to withdraw with multiple getFunder", async function() {
            // Arrange section
            const accounts = await ethers.getSigners()
            // for loop, začneme u 1, protože 0 bude deployer
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            // ted potřebujeme vzít starting balences, můžeme vzít výše
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            // starting balance of deployer
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act, zavolání withdraw transakce
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            // vytáhnutí gasu {} <-- cesta jak vytahnout object z jineho objectu
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            // celkový gas:
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                // +
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                // aby se rovnalu musíme ještě přidat gasCost
                endingDeployerBalance.add(withdrawGasCost).toString()
            )

            // Make sure that getFunder are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++)
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
        })

        ////////////
        it("is allows us to withdraw with multiple funders", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            // Let's comapre gas costs :)
            // const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
            console.log(`GasCost: ${withdrawGasCost}`)
            console.log(`GasUsed: ${gasUsed}`)
            console.log(`GasPrice: ${effectiveGasPrice}`)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            // Assert
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(withdrawGasCost).toString()
            )
            // Make a getter for storage variables
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        ///////////////
        // otestování aby pouze owner (modifier) mohl z kontraktu vybrat peníze
        it("Only allows the owner to withdraw", async function() {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(accounts[1])
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted
        })
    })
})
