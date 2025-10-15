const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AetherixStaking with USDT Rewards", function () {
  let owner, user;
  let aetx, usdt, staking;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    aetx = await Token.deploy("Aetherix Token", "AETX");
    await aetx.waitForDeployment();
    usdt = await Token.deploy("Fake USDT", "USDT");
    await usdt.waitForDeployment();

    const Staking = await ethers.getContractFactory("AetherixStaking");
    staking = await Staking.deploy(await aetx.getAddress(), await usdt.getAddress());
    await staking.waitForDeployment();

    await usdt.transfer(await staking.getAddress(), ethers.parseEther("10000"));
    await aetx.transfer(user.address, ethers.parseEther("1000"));
  });

  it("Should stake, accumulate rewards, and claim USDT", async function () {
    const stakingAddress = await staking.getAddress();

    await aetx.connect(user).approve(stakingAddress, ethers.parseEther("100"));
    await staking.connect(user).stake(ethers.parseEther("100"));

    await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    const pending = await staking.pendingReward(user.address);
    console.log("Pending reward:", ethers.formatEther(pending));

    const expectedReward = ethers.parseEther("5");
    const tolerance = ethers.parseEther("0.1");

    // Исправлено: используем pending, а не reward
    const diff = pending > expectedReward ? pending - expectedReward : expectedReward - pending;
    expect(diff).to.be.lte(tolerance);

    const usdtBalanceBefore = await usdt.balanceOf(user.address);
    await staking.connect(user).claimRewards();
    const usdtBalanceAfter = await usdt.balanceOf(user.address);

    const claimed = usdtBalanceAfter - usdtBalanceBefore;
    const claimedDiff = claimed > expectedReward ? claimed - expectedReward : expectedReward - claimed;
    expect(claimedDiff).to.be.lte(tolerance);

    console.log("✅ Reward claimed successfully!");
  });

  it("Should allow withdraw and claim rewards together", async function () {
  const stakingAddress = await staking.getAddress();

  await aetx.connect(user).approve(stakingAddress, ethers.parseEther("200"));
  await staking.connect(user).stake(ethers.parseEther("200"));

  await ethers.provider.send("evm_increaseTime", [182 * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine");

  const usdtBalanceBefore = await usdt.balanceOf(user.address);
  await staking.connect(user).withdraw(ethers.parseEther("100")); // выводим часть
  const usdtBalanceAfter = await usdt.balanceOf(user.address);

  const claimed = usdtBalanceAfter - usdtBalanceBefore;
  const expectedReward = ethers.parseEther("5"); // ← было 2.5, теперь 5
  const tolerance = ethers.parseEther("0.1");

  const diff = claimed > expectedReward ? claimed - expectedReward : expectedReward - claimed;
  expect(diff).to.be.lte(tolerance);

  console.log("✅ Withdraw + reward claim works!");
});
});