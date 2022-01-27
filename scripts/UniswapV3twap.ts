#! hh run
import { ethers, network, deployments } from "hardhat";
import { BigNumber, utils } from "ethers";
import { abi } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { IUniswapV3Pool } from "../types/IUniswapV3Pool";
import { TwapGetter } from "../types/TwapGetter";

const init = async () => {
  console.log(network.name, "init");
  await deployments.fixture(["TwapGetter"]);

  pool = new ethers.Contract(UAD_USDC, abi, ethers.provider) as IUniswapV3Pool;
  twapGetter = (await ethers.getContract("TwapGetter")) as TwapGetter;
};

const UAD_USDC = "0x681B4C3aF785DacACcC496B9Ff04f9c31BcE4090";
let pool: IUniswapV3Pool;
let twapGetter: TwapGetter;

const getTwap = async (duration: BigNumber) => {
  const sqrtPriceX96 = await twapGetter.getSqrtTwapX96(UAD_USDC, duration);
  // console.log("getTwap ~ sqrtPriceX96", sqrtPriceX96.toString());

  const priceX96 = await twapGetter.getPriceX96FromSqrtPriceX96(sqrtPriceX96);
  console.log("getTwap ~ priceX96", priceX96.toString());
};

const getTickTwap = async (duration: BigNumber) => {
  const tick = await pool.observe([duration, 0]);

  const tick0 = tick.tickCumulatives[0];
  const tick1 = tick.tickCumulatives[1];
  const tickTwap = tick1.sub(tick0).div(duration);
  console.log("getTickTwap ~ tickTwap", tickTwap.toString());

  // console.log("tickCumulatives 0", tick.tickCumulatives[0].toString());
  // console.log("tickCumulatives 1", tick.tickCumulatives[1].toString());
  // console.log("secondsPerLiquidityCumulativeX128s 0", tick.secondsPerLiquidityCumulativeX128s[0].toString());
  // console.log("secondsPerLiquidityCumulativeX128s 1", tick.secondsPerLiquidityCumulativeX128s[1].toString());
};

const main = async () => {
  await init();

  console.log("liquidity", utils.formatEther(await pool.liquidity()));

  await getTickTwap(BigNumber.from(60));
  await getTwap(BigNumber.from(60));
};

main().catch(console.error);