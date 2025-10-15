const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking", function () {
  let AETX, aetx;
  let Staking, staking;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    AETX = await ethers.getContractFactory("AETX");
    aetx = await AETX.deploy();

    const aetxAddress = await aetx.getAddress();

    Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(aetxAddress);

    await aetx.transfer(user.address, ethers.parseEther("1000"));
  });

  it("Should allow staking and withdrawing", async function () {
    const stakingAddress = await staking.getAddress();

    // Пользователь разрешает контракту тратить его токены
    await aetx.connect(user).approve(stakingAddress, ethers.parseEther("100"));

    // Стейкает 100 AETX
    await staking.connect(user).stake(ethers.parseEther("100"));

    // Проверяем баланс стейка
    expect(await staking.myStake()).to.equal(0n); // owner не стейкал
    expect(await staking.connect(user).myStake()).to.equal(ethers.parseEther("100"));

    // Выводит обратно
    await staking.connect(user).withdraw(ethers.parseEther("50"));
    expect(await staking.connect(user).myStake()).to.equal(ethers.parseEther("50"));
  });
});