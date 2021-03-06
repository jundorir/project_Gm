import loading from "@components/ChainLoading";
import chain from "../store/chain";
import {
  BaseERC20 as BaseERC20Abi,
  EmpireMavern as EmpireMavernAbi,
  Miner as MinerAbi,
  GameDB as GameDBAbi,
  BattleRoundSelf as BattleRoundSelfAbi,
  HeroManager as HeroManagerAbi,
  GuildManager as GuildManagerAbi,
  Market as MarketAbi,
  HeroNFT as HeroNFTAbi,
  MutilCall as MutilCallAbi,
  VerifyBattleReward as VerifyBattleRewardAbi,
  PropMarket as PropMarketAbi,
  verifyGuildFightReward as verifyGuildFightRewardAbi,
} from "../abi";
import { Toast } from "antd-mobile";
import { idx } from "@utils/idxLIst";
import { digitWei, computeSymbolToWei, computeWeiToSymbol } from "./common";
import { HeroRarity } from "@common/const/define/hero";
import { checkTransactionHash } from "@common/api";

let web3_Provider = null;
if (typeof window.web3 !== "undefined") {
  web3_Provider = new window.Web3(window.web3.currentProvider);
  window.utils = web3_Provider.utils;
  window.web3_Provider = web3_Provider;
}

export async function getAccounts() {
  return window.ethereum?.request({ method: "eth_accounts" });
}

let Global_Contract = {};
let Contract = {
  BaseERC20: "BaseERC20",
  EmpireMavern: "EmpireMavern",
  Miner: "Miner",
  GameDB: "GameDB",
  BattleRoundSelf: "BattleRoundSelf",
  HeroManager: "HeroManager",
  GuildManager: "GuildManager",
  Market: "Market",
  HeroNFT: "HeroNFT",
  MutilCall: "MutilCall",
  VerifyBattleReward: "VerifyBattleReward",
  PropMarket: "PropMarket",
  verifyGuildFightReward: "verifyGuildFightReward",
};
let Abi = {
  BaseERC20: BaseERC20Abi,
  EmpireMavern: EmpireMavernAbi,
  Miner: MinerAbi,
  GameDB: GameDBAbi,
  BattleRoundSelf: BattleRoundSelfAbi,
  HeroManager: HeroManagerAbi,
  GuildManager: GuildManagerAbi,
  Market: MarketAbi,
  HeroNFT: HeroNFTAbi,
  MutilCall: MutilCallAbi,
  VerifyBattleReward: VerifyBattleRewardAbi,
  PropMarket: PropMarketAbi,
  verifyGuildFightReward: verifyGuildFightRewardAbi,
};

function getNowUserAddress() {
  return chain.address;
}

export function enable() {
  return new Promise((resolve, reject) => {
    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask????????????!");
      return;
    }
    if (typeof window.web3 === "undefined") {
      console.log("????????????????????????Dapp?????????????????????");
      return;
    }
    if (window.ethereum.enable) {
      window.ethereum
        .enable()
        .then((accounts) => {
          resolve(accounts[0]);
        })
        .catch(function (reason) {
          reject(reason.message);
        });
      return;
    } else {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          resolve(accounts[0]);
        })
        .catch(function (reason) {
          reject(reason.message);
        });
    }
  });
}

function getContract(contractName, contractAddress) {
  if (contractAddress === undefined) {
    console.log(
      "???????????? ===> contractName, contractAddress",
      contractName,
      contractAddress
    );
    Toast.show({
      icon: "fail",
      content: "????????????",
    });
    return null;
  }
  if (web3_Provider === null) {
    if (typeof window.web3 !== "undefined") {
      web3_Provider = new window.Web3(window.web3.currentProvider);
      window.utils = web3_Provider.utils;
      window.web3_Provider = web3_Provider;
    }
  }
  if (web3_Provider === null) return null;
  if (
    [
      Contract.BaseERC20,
      Contract.EmpireMavern,
      Contract.Miner,
      Contract.DBAddress,
      Contract.BattleRoundSelf,
      Contract.HeroManager,
      Contract.GuildManager,
      Contract.GameDB,
      Contract.Market,
      Contract.HeroNFT,
      Contract.MutilCall,
      Contract.VerifyBattleReward,
      Contract.PropMarket,
    ].includes(contractName)
  ) {
    if (!Global_Contract[contractName + contractAddress])
      Global_Contract[contractName + contractAddress] =
        new web3_Provider.eth.Contract(Abi[contractName], contractAddress);
    return Global_Contract[contractName + contractAddress];
  }
  return null;
}

function sendAsync(
  params,
  {
    needLog = false,
    showLoading = true,
    diyLoading = null,
    needServerCheck = true,
  } = {}
) {
  //   loading.show();
  return new Promise((resolve, reject) => {
    window.ethereum.sendAsync(
      {
        method: "eth_sendTransaction",
        params: params,
        from: getNowUserAddress(),
      },
      async function (err, result) {
        // return;
        if (diyLoading) {
          diyLoading(true);
        } else {
          showLoading && loading.show();
        }
        if (!!err) {
          reject(err);
          if (diyLoading) {
            diyLoading(false);
          } else {
            showLoading && loading.hidden();
          }
          return;
        }
        if (result.error) {
          reject(result.error.message);
          if (diyLoading) {
            diyLoading(false);
          } else {
            showLoading && loading.hidden();
          }
          return;
        }
        if (result.result) {
          const receiptResult = await getTransactionReceiptStatus(
            result.result
          );

          if (receiptResult) {
            // ????????? ???????????? ?????? ???????????????????????????

            let checkResult = true;
            if (needServerCheck) {
              checkResult = await checkServerTransactionHashStatus(
                result.result
              );
            }

            if (checkResult) {
              if (diyLoading) {
                diyLoading(false);
              } else {
                showLoading && loading.hidden();
              }
              if (!needLog) {
                resolve(receiptResult.status); // res.status true or false;
              } else {
                resolve({
                  status: receiptResult.status,
                  logs: receiptResult.logs,
                }); // res.status true or false;
              }
            }
          } else {
          }
        }
      }
    );
  });
}

// ????????????hash????????????
function getTransactionReceiptStatus(hash) {
  return new Promise((resolve, reject) => {
    const a = setInterval(() => {
      web3_Provider.eth.getTransactionReceipt(hash).then((res) => {
        // console.log("getTransactionReceipt ==>", res);
        if (res) {
          clearInterval(a);
          resolve(res);
        }
      });
    }, 1000);
  });
}

// ?????????????????? hash????????????
async function checkServerTransactionHashStatus(hash) {
  return new Promise((resolve, reject) => {
    const a = setInterval(() => {
      checkTransactionHash(hash).then((res) => {
        // console.log("checkServerTransactionHash ==>", res);
        // clearInterval(a);
        // resolve(true);
        if (res?.processed === 1) {
          clearInterval(a);
          resolve(true);
        }
      });
    }, 1000);
  });
}

/**
 * ??????????????????
 * @returns
 */
export function approve(TokenAddress, contractAddress) {
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  let params = [
    {
      from: getNowUserAddress(),
      to: TokenAddress,
      value: "0x0",
      data: contract?.methods
        ?.approve(
          contractAddress,
          web3_Provider.utils.toHex(
            web3_Provider.utils.toBN("1000000000000000000000000000000000")
          )
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params, { needLog: true });
}

/**
 * ??????????????????????????????
 * @returns
 */
export function allowance(TokenAddress, contractAddress) {
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods
      ?.allowance(getNowUserAddress(), contractAddress)
      .call((err, result) => {
        if (err) {
          resolve(-1);
        }
        // console.log("allowance result ====> ", result);
        if (result < 10000000000000000000000000000000) {
          resolve(false);
        } else {
          resolve(result);
        }
      });
  });
}

export async function queryAllowance({ symbol, type = "door" }) {
  const TokenAddress = chain.currencyMap?.[symbol];
  const map = {
    door: chain.contractAddress?.door,
    market: chain.contractAddress?.market,
    materialMarket: chain.contractAddress?.PropMarket,
  };
  const contractAddress = map[type];
  const contract = getContract(Contract.BaseERC20, TokenAddress);

  const result = await new Promise((resolve) => {
    contract?.methods
      ?.allowance(getNowUserAddress(), contractAddress)
      .call((err, result) => {
        if (err) {
          resolve(-1);
        }
        resolve(result);
      });
  });
  return result / Math.pow(10, 18);
}
window.isApproveFlow = isApproveFlow;
/**
 * ????????????????????????????????????
 * @param {*} type 1??????MediaAddress,2??????MarketAddress
 * @param {*} TokenAddress ?????????U??????,????????????????????????
 * @returns
 */
export async function isApproveFlow({ symbol, type = "door" }) {
  const map = {
    door: chain.contractAddress?.door,
    market: chain.contractAddress?.market,
    materialMarket: chain.contractAddress?.PropMarket,
  };
  const contractAddress = map[type];
  try {
    let isAllowance = await allowance(
      chain.currencyMap?.[symbol],
      contractAddress
    );
    if (isAllowance) {
      return {
        status: true,
        approvement: isAllowance / Math.pow(10, 18),
      };
    }

    let { status, logs } = await approve(
      chain.currencyMap?.[symbol],
      contractAddress
    );
    if (status) {
      return {
        status: status,
        approvement: logs[0].data / Math.pow(10, 18),
      };
    }
  } catch (e) {
    return {
      status: false,
      approvement: 0,
    };
  }
}

/**
 * ????????????????????????
 * @param {*} TokenAddress
 */
export async function queryBalance(symbol) {
  const TokenAddress = chain.currencyMap?.[symbol];
  const contract = getContract(Contract.BaseERC20, TokenAddress);
  return new Promise((resolve) => {
    contract?.methods?.balanceOf(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      } else {
        resolve(result);
      }
    });
  });
}

//?????????????????????
export async function getCurrentBlock() {
  const blockNumber = await web3_Provider.eth.getBlockNumber();
  return blockNumber;
}
//????????????????????????
export async function getBlockgTime() {
  const blockNumber = await web3_Provider.eth.getBlockNumber();
  const blockTime = await web3_Provider.eth.getBlock(blockNumber);
  return blockTime.timestamp;
}

// ???????????? EmpireMavern

// LottyA ==> cost 20???u
// LottyB ==>  cost 30???u 5000EOCC
// LottyC ==> cost 1000 mmr

// primary ??????
// intermediate ??????
// senior ??????
export async function EmpireMavernLottery(type = "primary", diyLoading) {
  const Address = chain.contractAddress?.EmpireMavern;
  const contract = getContract(Contract.EmpireMavern, Address);

  // console.log("addresss", Address);

  const map = {
    primary: "LottyA",
    intermediate: "LottyB",
    senior: "LottyC",
  };
  let func = contract?.methods[map[type]];
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: func?.().encodeABI(),
    },
  ];
  const { status, logs } = await sendAsync(params, {
    needLog: true,
    showLoading: false,
    diyLoading,
    needServerCheck: true,
  });
  if (status === true) {
    const currentLog = logs.pop();
    const isNFT = chain.contractAddress?.HeroNFT === currentLog.address;
    if (isNFT) {
      // ???NFT
      const [, tokenId, baseId] = currentLog.topics;
      return {
        type: "NFT",
        tokenId: parseInt(tokenId),
        baseId: parseInt(baseId) + 1,
      };
    }
    return {
      type: "MATERIAL",
      materialKey: chain.materialMap?.[currentLog.address],
    };
  }
  return null;
}

export async function batchLotty(code = 1) {
  const Address = chain.contractAddress?.EmpireMavern;
  const contract = getContract(Contract.EmpireMavern, Address);

  let func = contract?.methods.batchLotty;
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: func?.(code).encodeABI(),
    },
  ];
  return sendAsync(params);
}

window.batchLotty = batchLotty;
// window.EmpireMavernLottery = EmpireMavernLottery;
// window.resetCard = resetCard;
// window.isApproveFlow = isApproveFlow;
// window.queryAllowance = queryAllowance;
// window.queryBalance = queryBalance;

/**
 * @??????
 * --------------------------------------------------------->
 */
/**
 * @??????_????????????
 * CURRENT_POWER
 */
export async function production_nowhave() {
  // console.log("????????????", Contract.GameDB, chain.contractAddress?.DBAddress);
  // console.log("Abi==>", Contract.GameDB);
  // console.log("Contract.GameDB-->", Contract);
  // console.log("chain.contractAddress?.GameDB", chain.contractAddress);
  const contract = getContract(
    Contract.GameDB,
    chain.contractAddress?.DBAddress
  );
  // console.log("contract", contract);
  return new Promise((resolve) => {
    contract?.methods
      ?.getUserData(getNowUserAddress(), idx.CURRENT_POWER)
      .call((err, result) => {
        if (err) {
          // console.log("err", err);
          resolve(false);
        }
        if (result) {
          // console.log("????????????", computeWeiToSymbol(result, 0));
          resolve(computeWeiToSymbol(result, 0));
        }
      });
  });
}
/**
 * @??????_???????????????
 * HERO_REWARD_POWER
 */
export async function production_totalOutput() {
  const contract = getContract(
    Contract.GameDB,
    chain.contractAddress?.DBAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.getUserData(getNowUserAddress(), idx.HERO_REWARD_POWER)
      .call((err, result) => {
        if (err) {
          // console.log("err", err);
          resolve(false);
        }
        if (result) {
          // console.log("result--->", result);
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 * @??????_???????????????
 *
 */
export async function production_unclaimed() {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  return new Promise((resolve) => {
    contract?.methods
      ?.getPendingCoin(getNowUserAddress())
      .call((err, result) => {
        if (err) {
          // console.log("err", err);
          resolve(false);
        }
        if (result) {
          // console.log("?????????EOCC--->", result, computeWeiToSymbol(result, 4));
          resolve(computeWeiToSymbol(result, 4));
        }
      });
  });
}
/**
 * @??????_????????????
 *
 */
export async function production_withDraw() {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.miner,
      value: "0x0",
      data: contract?.methods?.WithDrawCredit().encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * @??????_??????????????????
 *
 */
export async function production_sendHero(tokenID) {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  const wei = web3_Provider.utils.toBN(tokenID);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.miner,
      value: "0x0",
      data: contract?.methods
        ?.AddHeroToFarm(
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * @??????_??????????????????
 *
 */
export async function production_sendHeros(tokenIDS = []) {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  const gettokenIDS = tokenIDS.map((item) => {
    return web3_Provider.utils.toHex(
      web3_Provider.utils.toBN(web3_Provider.utils.toBN(item))
    );
  });
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.miner,
      value: "0x0",
      data: contract?.methods?.AddBatchHeroToFarm(tokenIDS).encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * @??????_????????????
 *
 */
export async function production_removeHeros(tokenIDS = []) {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  // const wei = web3_Provider.utils.toBN(tokenID);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.miner,
      value: "0x0",
      data: contract?.methods?.RemoveBatchHeroFromFarm(tokenIDS).encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * @??????_?????????????????????
 *
 */
export async function production_openFarm() {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.miner,
      value: "0x0",
      data: contract?.methods?.OpenFarmSystem().encodeABI(),
    },
  ];
  return sendAsync(params);
}
/**
 * @??????_????????????
 *
 */
export async function production_addFarm(openLandHex, roundHex, idx, sign) {
  const contract = getContract(Contract.Miner, chain.contractAddress?.miner);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.miner,
      value: "0x0",
      data: contract?.methods
        ?.AddFarmLand(
          getNowUserAddress(),
          "0x" + openLandHex,
          "0x" + roundHex,
          idx,
          sign
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// window.production_nowhave = production_nowhave;
// window.production_totalOutput = production_totalOutput;
// window.production_unclaimed = production_unclaimed;
// window.production_withDraw = production_withDraw;
// window.production_sendHero = production_sendHero;
// window.production_sendHeros = production_sendHeros;
// window.production_openFarm = production_openFarm;
// window.production_addFarm = production_addFarm;
// window.production_removeHeros = production_removeHeros;
// ???????????? GameDB --->getUserData(CURRENT_POWER)
// ??????????????? GameDB --->getUserData(HERO_REWARD_POWER)
// ????????? Miner --->getPendingCoin()
// ???????????? Miner --->WithDrawCredit()
// ?????????????????? Miner --->AddHeroToFarm()
// ?????????????????? Miner --->AddBatchHeroToFarm([??????ID?????????])
// ??????????????? Miner --->OpenFarmSystem(?????????????????????????????????????????????????????????????????????)
// ???????????? Miner --->AddFarmLand(??????mmr??????????????????mmr?????????????????????)
// ?????????????????? GameDB --->getUserData(CURRENT_POWER)

/**
 * @??????
 * --------------------------------------------------------->
 */
/**
 * @??????_????????????
 * GameDB   getFirstWinner
 */
export async function battle_getFirstWinner(roundid) {
  const contract = getContract(
    Contract.GameDB,
    chain.contractAddress?.DBAddress
  );
  const wei = web3_Provider.utils.toBN(roundid);
  return new Promise((resolve) => {
    contract?.methods
      ?.getFirstWinner(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
      .call((err, result) => {
        if (err) {
          // console.log("err", err);
          resolve(false);
        }
        if (result) {
          // console.log("result--->", result);
          resolve(result);
        }
      });
  });
}
/**
 * @??????_???????????????????????????
 * BattleRoundSelf  getRoundNeedPower
 */
export async function battle_needPower(roundid) {
  const contract = getContract(
    Contract.BattleRoundSelf,
    chain.contractAddress?.BattleRoundSelf
  );
  const wei = web3_Provider.utils.toBN(roundid);
  return new Promise((resolve) => {
    contract?.methods
      ?.getRoundNeedPower(
        web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
      )
      .call((err, result) => {
        if (err) {
          // console.log("err", err);
          resolve(false);
        }
        if (result) {
          resolve(result);
        }
      });
  });
}
/**
 * ?????????_??????*5???EOCC_??????*5 Attack
 */

/**
 * @??????_????????????????????????
 * GameDB getUserData   idx=NowRound
 */
export async function battle_nowRound() {
  const contract = getContract(
    Contract.GameDB,
    chain.contractAddress?.DBAddress
  );
  return new Promise((resolve) => {
    contract?.methods
      ?.getUserData(getNowUserAddress(), idx.NowRound)
      .call((err, result) => {
        if (err) {
          // console.log("err", err);
          resolve(false);
        }
        if (result) {
          // console.log("result--->", result);
          // resolve(computeWeiToSymbol(result, 4));
          resolve(result);
        }
      });
  });
}
/**
 * @????????????
 *BattleRoundSelf   Attack (??????)
 */
export async function battle_attack(roundid) {
  const contract = getContract(
    Contract.BattleRoundSelf,
    chain.contractAddress?.BattleRoundSelf
  );
  const wei = web3_Provider.utils.toBN(roundid);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.BattleRoundSelf,
      value: "0x0",
      data: contract?.methods
        ?.Attack(web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei)))
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
// window.battle_getFirstWinner = battle_getFirstWinner;
// window.battle_needPower = battle_needPower;
// window.battle_attack = battle_attack;
// window.battle_nowRound = battle_nowRound;
/// =======>

export async function UseExpBook(heroId, type, number) {
  // console.log("heroId, type, number== ==>", heroId, type, number);
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);

  const map = {
    ExperienceBookPrimary: "UseExpBookA",
    ExperienceBookIntermediate: "UseExpBookB",
    ExperienceBookSenior: "UseExpBookC",
  };
  let func = contract?.methods[map[type]];
  const wei = computeSymbolToWei(number);
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: func?.(heroId, wei).encodeABI(),
    },
  ];

  return sendAsync(params);
}

export async function UseSpiritDrug() {
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods?.UseSpiritDrug().encodeABI(),
    },
  ];
  return sendAsync(params);
}

export async function HeroSynthesis(heroId, materialHeroIdArray, type) {
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);
  // console.log(
  //   "chain.contractAddress?.HeroManager",
  //   chain.contractAddress?.HeroManager
  // );
  const map = {
    [HeroRarity.N]: "ComposeHero1",
    [HeroRarity.R]: "ComposeHero2",
    [HeroRarity.SR]: "ComposeHero3",
  };
  let func = contract?.methods[map[type]];
  // console.log(
  //   "heroId, materialHeroIdArray",
  //   heroId,
  //   materialHeroIdArray,
  //   map[type],
  //   type
  // );
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: func?.(heroId, materialHeroIdArray).encodeABI(),
    },
  ];

  const { status, logs } = await sendAsync(params, {
    needLog: true,
    showLoading: true,
    diyLoading: null,
    needServerCheck: true,
  });
  if (status === true) {
    const currentLog = logs.pop();
    const [, , tokenId, baseId] = currentLog.topics;
    return {
      tokenId: parseInt(tokenId),
      baseId: parseInt(baseId) + 1,
    };
  }
  return null;
}

export async function UpgradeHero(heroId, materialHeroId) {
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);
  // console.log(
  // "chain.contractAddress?.HeroManager",
  //   chain.contractAddress?.HeroManager
  // );

  // console.log(heroId, materialHeroId, Address);
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods?.UpgradeHero(heroId, materialHeroId).encodeABI(),
    },
  ];

  return sendAsync(params);
}

export async function resetCard(heroId) {
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);

  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods?.resetCard(heroId).encodeABI(),
    },
  ];

  return sendAsync(params);
}

// ?????? ????????????
export async function UpdateHeroSlot(slotId, tokenId) {
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);

  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods?.UpdateHeroSlot(slotId, tokenId).encodeABI(),
    },
  ];

  return sendAsync(params);
}

export async function UpdateHeroSlotBatch(
  diffSlotArray,
  oldTokenIdArray,
  newTokenIdArray
) {
  const Address = chain.contractAddress?.HeroManager;
  const contract = getContract(Contract.HeroManager, Address);
  // console.log(
  //   "UpdateHeroSlotBatch",
  //   diffSlotArray,
  //   oldTokenIdArray,
  //   newTokenIdArray
  // );
  let params = [
    {
      from: getNowUserAddress(),
      to: Address,
      value: "0x0",
      data: contract?.methods
        ?.UpdateHeroSlotBatch(diffSlotArray, oldTokenIdArray, newTokenIdArray)
        .encodeABI(),
    },
  ];

  return sendAsync(params);
}

// ????????????
export async function requestSignuature(signData) {
  let signString = signData;
  if (typeof signData === "object") {
    const sortedKey = Object.keys(signData).sort();
    signString = sortedKey.map((key) => signData[key]).join("_");
  }
  if (web3_Provider === null) {
    if (typeof window.web3 !== "undefined") {
      web3_Provider = new window.Web3(window.web3.currentProvider);
      window.utils = web3_Provider.utils;
      window.web3_Provider = web3_Provider;
    }
  }
  return web3_Provider.eth.personal.sign(signString, getNowUserAddress());
}

/**
 * ????????????
 */
//??????_????????????
export async function CreateGuild() {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.CreateGuild().encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_????????????
export async function ExitGuild() {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.ExitGuild().encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_??????
export async function dotnetGuild(guildid, amount) {
  // console.log("??????", guildid, amount);
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  const wei = computeSymbolToWei(amount);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods
        ?.dotnetGuild(
          guildid,
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_????????????
export async function RemoveMember(guildid, user) {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.RemoveMember(guildid, user).encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_????????????
export async function setGuildMaster(guildid, newmaster) {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.setGuildMaster(guildid, newmaster).encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_??????
export async function AddMember(guildid, user) {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.AddMember(guildid, user).encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_??????
export async function JoinGuild(guildid) {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.JoinGuild(guildid).encodeABI(),
    },
  ];
  return sendAsync(params);
}
//??????_??????
export async function UpgradeLevel(guildid) {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.UpgradeLevel(guildid).encodeABI(),
    },
  ];
  return sendAsync(params);
}
// window.CreateGuild = CreateGuild;
// window.ExitGuild = ExitGuild;
// window.dotnetGuild = dotnetGuild;
// window.RemoveMember = RemoveMember;
// window.setGuildMaster = setGuildMaster;
// window.AddMember = AddMember;
// window.JoinGuild = JoinGuild;

// market

// ??????
export async function Market_Hero_UpShelf(tokenId, price, symbol) {
  const contract = getContract(Contract.Market, chain.contractAddress?.market);
  const TokenAddress = chain.currencyMap?.[symbol];
  const wei = computeSymbolToWei(price);
  const HexWei = web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei));
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.market,
      value: "0x0",
      data: contract?.methods
        ?.upShelf(tokenId, {
          price: HexWei,
          token: TokenAddress,
        })
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ??????
export async function Market_Hero_DownShelf(tokenId) {
  const contract = getContract(Contract.Market, chain.contractAddress?.market);
  // console.log("tokenId", tokenId);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.market,
      value: "0x0",
      data: contract?.methods?.downShelf(tokenId).encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ????????????
export async function Market_Hero_Buy(tokenId) {
  const contract = getContract(Contract.Market, chain.contractAddress?.market);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.market,
      value: "0x0",
      data: contract?.methods?.buy(tokenId).encodeABI(),
    },
  ];
  return sendAsync(params);
}

// NFT???????????????
export async function Market_Hero_Approve(tokenId) {
  const contract = getContract(
    Contract.HeroNFT,
    chain.contractAddress?.HeroNFT
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.HeroNFT,
      value: "0x0",
      data: contract?.methods
        ?.approve(chain.contractAddress?.market, tokenId)
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ???????????????????????????
export async function queryAllBalanceOf() {
  const contract = getContract(
    Contract.MutilCall,
    chain.contractAddress?.mutilcall
  );

  return new Promise((resolve) => {
    contract?.methods?.AllBalanceOf(getNowUserAddress()).call((err, result) => {
      if (err) {
        resolve(false);
      } else {
        resolve(result);
      }
    });
  });
}

// window.queryAllBalanceOf = queryAllBalanceOf;

//
/**
 * goldAmount, ===> EOCC
 * expBookAmount ===> ???????????????
 * id,
 * sign
 */
export async function Battle_Reward(expHex, goldHex, hoeHex, idx, sign) {
  const contract = getContract(
    Contract.VerifyBattleReward,
    chain.contractAddress?.verifyHoeReward
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.verifyHoeReward,
      value: "0x0",
      data: contract?.methods
        ?.reward(
          getNowUserAddress(),
          "0x" + expHex,
          "0x" + goldHex,
          "0x" + hoeHex,
          idx,
          sign
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ???????????????Market
export async function Market_isApprovedForAll() {
  const contract = getContract(
    Contract.HeroNFT,
    chain.contractAddress?.HeroNFT
  );

  const MarketAddress = chain.contractAddress?.market;
  return new Promise((resolve) => {
    contract?.methods
      ?.isApprovedForAll(getNowUserAddress(), MarketAddress)
      .call((err, result) => {
        if (err) {
          resolve(false);
        } else {
          resolve(result);
        }
      });
  });
}

export async function Market_QueryFee() {
  const contract = getContract(Contract.Market, chain.contractAddress?.market);

  return new Promise((resolve) => {
    contract?.methods?._fee().call((err, result) => {
      if (err) {
        resolve(false);
      } else {
        resolve(result);
      }
    });
  });
}

// ?????????Market

export async function Market_ApprovedForAll() {
  const contract = getContract(
    Contract.HeroNFT,
    chain.contractAddress?.HeroNFT
  );
  const MarketAddress = chain.contractAddress?.market;

  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.HeroNFT,
      value: "0x0",
      data: contract?.methods
        ?.setApprovalForAll(MarketAddress, true)
        .encodeABI(),
    },
  ];
  return sendAsync(params, {
    needLog: false,
    showLoading: true,
    diyLoading: null,
    needServerCheck: false,
  });
}

// window.sendToOther = sendToOther;
export async function sendToOther(receiveAddress, number, type) {
  const contract = getContract(Contract.BaseERC20, chain.currencyMap?.[type]);
  const wei = computeSymbolToWei(number);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.currencyMap?.[type],
      value: "0x0",
      data: contract?.methods
        ?.transfer(
          receiveAddress,
          web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei))
        )
        .encodeABI(),
    },
  ];
  return sendAsync(params, {
    needLog: false,
    showLoading: true,
    diyLoading: null,
    needServerCheck: false,
  });
}

export async function Hero_Transfer(address, tokenId) {
  // return false;
  const contract = getContract(
    Contract.HeroNFT,
    chain.contractAddress?.HeroNFT
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.HeroNFT,
      value: "0x0",
      data: contract?.methods?.transfer(address, tokenId).encodeABI(),
    },
  ];
  return sendAsync(params);
}
// ??????
export async function Market_Material_UpShelf(
  materialKey,
  materialAmount,
  price,
  symbol
) {
  // console.log(`Market_Material_UpShelf =====> `, arguments);
  const contract = getContract(
    Contract.PropMarket,
    chain.contractAddress?.PropMarket
  );
  const TokenAddress = chain.currencyMap?.[symbol];
  const MaterialAddress = chain.currencyMap?.[materialKey];
  const MaterialWei = computeSymbolToWei(materialAmount);
  const HexMaterialWei = web3_Provider.utils.toHex(
    web3_Provider.utils.toBN(MaterialWei)
  );
  const wei = computeSymbolToWei(price);
  const HexWei = web3_Provider.utils.toHex(web3_Provider.utils.toBN(wei));
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.PropMarket,
      value: "0x0",
      data: contract?.methods
        ?.upShelf({
          propAmt: HexMaterialWei,
          propAddr: MaterialAddress,
          batchPrice: HexWei,
          token: TokenAddress,
        })
        .encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ??????
export async function Market_Material_DownShelf(orderId) {
  const contract = getContract(
    Contract.PropMarket,
    chain.contractAddress?.PropMarket
  );
  // console.log(`Market_Material_DownShelf =====> `, arguments);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.PropMarket,
      value: "0x0",
      data: contract?.methods?.downShelf(orderId).encodeABI(),
    },
  ];
  return sendAsync(params);
}

// ????????????
export async function Market_Material_Buy(orderId) {
  // console.log(`Market_Material_DownShelf =====> `, arguments);

  const contract = getContract(
    Contract.PropMarket,
    chain.contractAddress?.PropMarket
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.PropMarket,
      value: "0x0",
      data: contract?.methods?.buy(orderId).encodeABI(),
    },
  ];
  return sendAsync(params);
}

export async function Market_Material_QueryFee() {
  const contract = getContract(
    Contract.PropMarket,
    chain.contractAddress?.PropMarket
  );
  return new Promise((resolve) => {
    contract?.methods?._fee().call((err, result) => {
      if (err) {
        resolve(false);
      } else {
        resolve(result);
      }
    });
  });
}

// window.Market_Material_UpShelf = Market_Material_UpShelf;
// window.Market_Material_DownShelf = Market_Material_DownShelf;
// window.Market_Material_Buy = Market_Material_Buy;

//?????????__??????
export async function UnionBattle_signup() {
  const contract = getContract(
    Contract.GuildManager,
    chain.contractAddress?.guidmanager
  );
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.guidmanager,
      value: "0x0",
      data: contract?.methods?.IntoTodayWar().encodeABI(),
    },
  ];
  return sendAsync(params);
}
//?????????__??????
export async function UnionBattle_getMMR({
  userAddress,
  usdtHex,
  mmrsHex,
  idx,
  sign,
}) {
  const contract = getContract(
    Contract.verifyGuildFightReward,
    chain.contractAddress?.verifyGuildFightReward
  );
  console.log("??????", userAddress, usdtHex, mmrsHex, idx, sign);
  let params = [
    {
      from: getNowUserAddress(),
      to: chain.contractAddress?.verifyGuildFightReward,
      value: "0x0",
      data: contract?.methods?.reward(
        userAddress,
        "0x" + usdtHex,
        "0x" + mmrsHex,
        idx,
        sign
      ),
    },
  ];
  return sendAsync(params);
}
