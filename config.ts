import BigNumber from "bignumber.js";
BigNumber.config({ EXPONENTIAL_AT: 60 });

export default {
  DAOAdmin: {
    MINIMUM_QUORUM_PERCENT: 1,
    DEBATING_PERIOD_DURATION: 1800,
    WHITELIST: [
      "0xDDDE98CeE34E286457220fF26d95143634FB0267",
      "0xa464b30c34eD3776fa557891F0FC5a1ab74c9e24",
      "0x8Ec37F84a2269a975A6Df2e34e9b1fe165CCd80C",
      "0xE978248b88D7B939bCA9C0341A6f133763f7df5a",
      "0xadD3053cB4A2DFb5A812cAa1EF9Ad520aC0dc5A2",
      "0x06557D3c75fB0142d92656A5636363c84b63d2d0",
      "0xa2e9F1FFCE8734CC882c2e8d4e9d26b59FfA1B94",
    ],

    SELECTORS: [
      // AdminIndex
      "0xd5da6173", // setMaxShare
      "0xdc53e5cf", // setRebalancePeriod
      "0xbb9cd698", // newIndexComposition
      // Index common
      "0xd431b1ac", // setPause
      "0x601c0029", // setNameIndex(string)
      "0xc45618f5", // setFeeStake
      "0x99331510", // setFeeUnStake
      "0xbf4e56b3", // setActualToken(address)
      // DAO common
      "0xd7a1284a", // addSelector
      "0x67fc22c6", // removeSelector
      // DAO community
      "0x4d148673", // changePeriodDuration
      "0x00c2af11", // changeMinimumQuorumPercent
      // DAO Admin
      "0x9c54df64", // addAdmins
      "0x377e11e0", // removeAdmins
      "0x7c2d6e01", // setPeriodDuration
      "0x4eb647bc", // setMinimumQuorumPercent
      // factoryAdmin
      "0xf0bc238e", // mint
      // common factory
      "0xe23cf6ed", // changeIndexMaster(address)
      "0x86eff039", // changeMainParam(address,address,address,address,address,uint256)
      // PartnerProgram
      "0x85977e19", // setPercentReward(uint256[])
      // Treasure
      "0xada57448", // withdrawTax(address,uint256,address)
    ],
  },

  DAOCommunity: {
    MINIMUM_QUORUM_PERCENT: 1,
    DEBATING_PERIOD_DURATION: 1800,
    SELECTORS: [
      // CommunityIndex
      "0xdc53e5cf", // setRebalancePeriod
      "0x7475071f", // incrementMaxAssets
      "0xef00325a", // decrementMaxAssets
      "0x6746eb7c", // excludeAsset
      "0x8f08f324", // includeAsset
      "0x4d148673", // changePeriodDuration(uint256)
      "0xf0bc238e", // mint
    ],
  },

  PartnerProgram: {
    PERCENT_REWARD: ["1000000"], // 1%
  },

  POLX: {
    NAME: "POLX",
    SYMBOL: "POLX",
    INITIAL_SUPPLY: "5000000",
  },

  FactoryAdmin: {
    REBALANCE_PERIOD: 3600 * 2, // 3600 * 24 * 90
  },

  FactoryCommunity: {
    REBALANCE_PERIOD: 3600 * 2,
  },

  IndexAdmin: {
    ASSETS: [
      "0x187ae45f2d361cbce37c6a8622119c91148f261b",
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
      "0xe5417af564e4bfda1c483642db72007871397896",
      "0x580a84c73811e1839f75d86d75d88cca0c241ff4",
      "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
      "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",
      "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    ],
    START_PRICE: "1000000",
    REBALANCE_PERIOD: 60 * 60 * 2,
    NAME_INDEX: "Polyastic DeFi Index",
  },

  IndexCommunity: {
    ASSETS: [
      "0x187ae45f2d361cbce37c6a8622119c91148f261b", // POLX
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
      "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32", // TEL
      "0x23e8b6a3f6891254988b84da3738d2bfe5e703b9", // WELT
      "0xB5C064F955D8e7F38fE0460C556a72987494eE17", // QUICK
    ],
    START_PRICE: "1000000",
    REBALANCE_PERIOD: 3600 * 2,
    NAME_INDEX: "Polylastic Community DAO Index",
  },

  mumbai: {
    WMATIC: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    VALIDATOR_ADDRESS: "0xf514358dE9C397D164196403d59C78E7402aec0F",
    USDC_ADDRESS: "0x59610865a0350d130382351F88d51979888c4FCc",
    ADAPTER_ADDRESS: "0x8954AfA98594b838bda56FE4C12a09D7739D179b",
    POLX_ADDRESS: "0xB59Df8779988DE0bA5a6F3FCc12A0e91c58B988F",

    TRESUARE_ADDRESS: "0xAa2Cba032B72CbfE9692712c3Ebd97Aeb49D5501",
    PARTNER_PROGRAM: "0x960Cea1BA7d114Ef373d5b99626a427D986e3DDE",

    DAO_ADMIN_ADDRESS: "0x21FAb4c2e26A9206D8cbB5a054EA789612acE85e",
    INDEX_ADMIN_MASTER: "0x1899bCCa24eA94a353cE798b7fD7D668f6315106",
    FACTORY_ADMIN_ADDRESS: "0x6d8304A98987094508b5fD2bC23A1A5EE0Aa52DF",

    INDEX_ADMIN_1: "0xcD7F89B5f9C675e42F59CEe271FdE2c95Bcb5Bae",
    INDEX_ADMIN_2: "0x359FA6447e6e1D5e9142c9BA1E511d8190596419",
    INDEX_ADMIN_3: "0x7602D921C67958555a9CD57dc9D45934Ae77c15B",
    INDEX_ADMIN_4: "0xc180D2997D57Ac7c19064fF6F961e012DF4b66AB",
    INDEX_ADMIN_5: "0x8026437b6BFF422dB12DB24DE6CdB5B6924140ef",

    DAO_COMMUNITY_ADDRESS: "0x758E541EE509a5076a9220a1c39868fcc81Eaf96",
    INDEX_COMMUNITY_MASTER: "0x40022525808aeca1E755b6a9D9f95d6c4BC86303",
    FACTORY_COMMUNITY_ADDRESS: "0x282712C618D87EF2136d059C68e54dDf89b7D3FE",

    INDEX_COMMUNITY_1: "0x496688c4A0B3a0dBaF50BFab7BE289966799a066",
    INDEX_COMMUNITY_2: "0x8be184809BC589E22F78D1dAB2EDe5C1980FFBA1",
  },

  polygon: {
    WMATIC: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    VALIDATOR_ADDRESS: "0xC4AC0436A5907d42B4d7002d3dB973404429e413",
    USDC_ADDRESS: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    ADAPTER_ADDRESS: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    POLX_ADDRESS: "0x187ae45f2d361cbce37c6a8622119c91148f261b",

    TRESUARE_ADDRESS: "0x9e9DbD4F05eE97bA65965A674FaC39bc926E4690",
    PARTNER_PROGRAM: "0x32CA2155B88eDD520615821caB206e8fB730CE7a",

    DAO_ADMIN_ADDRESS: "0x16Ce44D883704D1E20939165Dad3fca7Dc37459F",
    INDEX_ADMIN_MASTER: "0xf85A7543404675BA29489dEEeFE194F9995890bb",
    FACTORY_ADMIN_ADDRESS: "0xB31FFBeaFa73FDFD0A626869814bd25A753086b5",

    INDEX_ADMIN_1: "0x09914F6a94af208ef74af46bdb2eC46CdDac8c2B",
    INDEX_ADMIN_2: "0x0939EC737B267E0e732755EC674D1aaD71957dd1",
    INDEX_ADMIN_3: "0x6E844918ED30D9E07d7CA566a2800512e5934259",
    INDEX_ADMIN_4: "",
    INDEX_ADMIN_5: "",

    DAO_COMMUNITY_ADDRESS: "0x8B97843067245B5B84d11Cc8c46468c9a2e0064f",
    INDEX_COMMUNITY_MASTER: "0x26E4b321B27E0B1B52d95ef7EF2a90B0e3e5462d",
    FACTORY_COMMUNITY_ADDRESS: "0x5853af626791A4CEd697A60726Ba3bea6ee5FD7A",

    INDEX_COMMUNITY_1: "0x17808D278dEb1Ce4224d22c7E978Ae30D9655F2F",
    INDEX_COMMUNITY_2: "",
  },
} as { [keys: string]: any };