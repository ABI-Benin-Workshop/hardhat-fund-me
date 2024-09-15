import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const deployFundMe: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    let ethUsdPriceFeedAddress: string;
    const ethUsdPriceFeedAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdPriceFeedAggregator.address;

    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        log: true,
        args: [ethUsdPriceFeedAddress],
    })
}


export default deployFundMe
deployFundMe.tags = ["all", "fundMe"]