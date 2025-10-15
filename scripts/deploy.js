// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());

  // 1. Деплоим AETX
  const AETX = await ethers.getContractFactory("AETX");
  const aetx = await AETX.deploy();
  await aetx.waitForDeployment();
  console.log("AETX deployed to:", await aetx.getAddress());

  // 2. Деплоим фейковый USDT (для тестов)
  const Token = await ethers.getContractFactory("Token");
  const usdt = await Token.deploy("Fake USDT", "USDT");
  await usdt.waitForDeployment();
  console.log("USDT deployed to:", await usdt.getAddress());

  // 3. Деплоим Staking
  const Staking = await ethers.getContractFactory("AetherixStaking");
  const staking = await Staking.deploy(await aetx.getAddress(), await usdt.getAddress());
  await staking.waitForDeployment();
  console.log("Staking deployed to:", await staking.getAddress());

  // 4. Пополняем стейкинг USDT (чтобы были средства для выплат)
  const usdtAmount = ethers.parseEther("10000");
  await usdt.transfer(await staking.getAddress(), usdtAmount);
  console.log("Staking contract funded with 10,000 USDT");

  // 5. Минтим AETX для deployer (чтобы можно было стейкать)
  // (AETX уже заминчен в конструкторе — 1 млн токенов у deployer)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});