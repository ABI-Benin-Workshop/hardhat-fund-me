import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
const DECIMALS = "18";
const INITIAL_PRICE = "2300000000000000000000"

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log(`Deploying MockV3Aggregator...`);
   const mockV3Aggregator = await deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: deployer,
        log: true,
        args: [DECIMALS, INITIAL_PRICE],
    })
    log(`MockV3Aggregator deployed at ${mockV3Aggregator.address}`)
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]