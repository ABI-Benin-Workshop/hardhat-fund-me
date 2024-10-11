import { assert, expect } from "chai"
import { network, ethers, deployments } from "hardhat"
import { FundMe, MockV3Aggregator } from "../typechain-types"
import { developmentChains } from "../helper-hardhat-config";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"

describe("FundMe", async function () {
    let fundMe: FundMe
    let mockV3Aggregator: MockV3Aggregator
    let deployer: SignerWithAddress
    let otherAccount: SignerWithAddress

    beforeEach(async () => {
        if (!developmentChains.includes(network.name)) {
            throw ("Wrong network")
        }
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        otherAccount = accounts[1]
        await deployments.fixture(["all"])
        fundMe = await ethers.getContractAt("FundMe", (await deployments.get("FundMe")).address)
        mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", (await deployments.get("MockV3Aggregator")).address)
    })


    describe('constructor', () => {
        it("sets the aggregator address correctly", async () => {
            const response = await fundMe.priceFeed()
            assert.equal(response, ((await deployments.get("MockV3Aggregator")).address))
        })
    })
    describe('fund', () => {
        it("Should fails if you dont send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it("Should updates the amounts data structure", async () => {
            const fundedAmount = ethers.parseEther("1").toString()
            await fundMe.fund({ value: fundedAmount })

            const response = await fundMe.getAddressToAmountFunded(deployer.address)
            assert.equal(response.toString(), fundedAmount)
        })

    })
    describe('withdraw', () => {

        beforeEach(async () => {
            await fundMe.fund({ value: ethers.parseEther("1") })
        })

        it("Should give a single funder their ETH back", async () => {
            const startingFundmeBalance = await fundMe.runner?.provider?.getBalance(
                (await fundMe.getAddress())
            )
            const startingDeployerBalance = await fundMe.runner?.provider?.getBalance(
                (deployer.address)

            )

            const transctionResponse = await fundMe.withdraw()
            const transctionReceipt = await transctionResponse.wait()
            const { gasUsed, gasPrice } = transctionReceipt!

            const gastCost = gasUsed * gasPrice
            const endingFundMeBalance = await fundMe.runner?.provider?.getBalance((await fundMe.getAddress()))

            const endingDeployerBalance = await fundMe.runner?.provider?.getBalance(
                (deployer.address)

            )

            assert.equal(endingFundMeBalance?.toString(), "0")
            assert.equal(
                (startingFundmeBalance! + startingDeployerBalance!).toString(),
                (endingDeployerBalance! + gastCost).toString()
            )

        })


    })

})