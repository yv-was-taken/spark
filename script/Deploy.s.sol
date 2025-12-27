// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SparkLottery} from "../src/SparkLottery.sol";

contract DeployScript is Script {
    function run() external {
        // Pyth Entropy addresses
        // Arbitrum Sepolia
        address entropy = vm.envOr("ENTROPY_ADDRESS", address(0x549Ddff35D8C827f8a6ef392e7C16532a103d8e2));
        address entropyProvider = vm.envOr("ENTROPY_PROVIDER", address(0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344));

        console.log("Deploying SparkLottery...");
        console.log("Entropy Address:", entropy);
        console.log("Entropy Provider:", entropyProvider);
        console.log("Deployer:", msg.sender);

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        SparkLottery lottery = new SparkLottery(entropy, entropyProvider);

        vm.stopBroadcast();

        console.log("SparkLottery deployed to:", address(lottery));
        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Add this to your .env.local:");
        console.log("NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS=%s", address(lottery));
    }
}
