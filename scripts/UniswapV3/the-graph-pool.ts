#! ts-node

import type { Response } from "node-fetch";
import fetch from "node-fetch";
import { ethers, BigNumber, FixedNumber } from "ethers";

const api = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
const gql = `
{
  pools(where: {id: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"}) {
    id
    token0Price
    liquidity
    feeTier
    totalValueLockedUSD
    untrackedVolumeUSD
    volumeUSD
    sqrtPrice
    token0Price
    token1Price
    token0 {
      symbol
    }
    token1 {
      symbol
    }
  }
}
`;

const runQuery = async (url: string, query: Object): Promise<string> => {
  const res: Response = await fetch(url, { method: "POST", body: JSON.stringify({ query }) });
  return await res.json();
};

runQuery(api, gql)
  .then((res: any) => {
    console.log(JSON.stringify(res, null, "  "));

    const pool0 = res.data.pools[0];
    console.log("pool0.totalValueLockedUSD", pool0.totalValueLockedUSD);
    const [partInt, partDec] = (pool0.totalValueLockedUSD as string).split(".");
    const totalValueLockedUSD = BigNumber.from(`${partInt}${partDec.slice(0, 18)}`);
    console.log("totalValueLockedUSD", ethers.utils.formatEther(totalValueLockedUSD));

    const liquidity = pool0.liquidity;
    console.log("main ~ liquidity", liquidity);

    // const lpPriceUSD = totalValueLockedUSD.div(liquidity);
    // console.log("LP PRICE USD", ethers.utils.formatEther(lpPriceUSD));
  })
  .catch(console.error);
