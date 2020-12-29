import config from "../config";
import async from 'async';
import {
  ERROR,
  GET_BALANCES,
  BALANCES_RETURNED,
  GET_BALANCES_LIGHT,
  BALANCES_LIGHT_RETURNED,
  ZAP,
  ZAP_RETURNED,
  GET_BEST_PRICE,
  GET_BEST_PRICE_RETURNED,
  USD_PRICE_RETURNED,
  MAX_UINT256,
} from '../constants';
import Web3 from 'web3';
import BigNumber from 'bignumber.js'

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  fortmatic,
  portis,
  squarelink,
  torus,
  authereum
} from "./connectors";

const rp = require('request-promise');
const ethers = require('ethers');

const Dispatcher = require('flux').Dispatcher;
const Emitter = require('events').EventEmitter;

const dispatcher = new Dispatcher();
const emitter = new Emitter();

class Store {
  constructor() {

    const defaultValues = this._getDefaultValues()

    this.store = {
      statistics: [],
      universalGasPrice: '70',
      ethPrice: 0,
      dashboard: defaultValues.dashboard,
      aprs: defaultValues.aprs,
      assets: defaultValues.assets,
      usdPrices: null,
      account: {},
      web3: null,
      pricePerFullShare: 0,
      yields: [],
      aggregatedYields: [],
      aggregatedHeaders: [],
      uniswapYields: [],
      uniswapLiquidity: [],
      events: [],
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
        Fortmatic: fortmatic,
        Portis: portis,
        Squarelink: squarelink,
        Torus: torus,
        Authereum: authereum
      },
      web3context: null,
      languages: [
        {
          language: 'English',
          code: 'en'
        },
        {
          language: 'Japanese',
          code: 'ja'
        },
        {
          language: 'Chinese',
          code: 'zh'
        },
        {
          languages: 'European Portuguese',
          code: 'pt'
        }
      ],
      curvBalance: 0,
      curveContracts: [
        {
          id: 'crvV1',
          symbol: 'compound.curve.fi',
          version: 1,
          erc20address: '0x3740fb63ab7a09891d7c0d4299442a551d06f5fd',
          decimals: 18,
          balance: 0
        },
        {
          id: 'crvV2',
          symbol: 'usdt.curve.fi',
          version: 2,
          erc20address: '0x9fc689ccada600b6df723d9e47d84d76664a1f23',
          decimals: 18,
          balance: 0
        },
        {
          id: 'crvV3',
          symbol: 'y.curve.fi',
          version: 3,
          erc20address: '0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8',
          decimals: 18,
          balance: 0
        },
        {
          id: 'crvV4',
          symbol: 'busd.curve.fi',
          version: 4,
          erc20address: '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B',
          decimals: 18,
          balance: 0
        }
      ],
      ethBalance: 0,
      sCrvBalance:  0
    }

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case GET_BALANCES_LIGHT:
            this.getBalancesLight(payload);
            break;
          case GET_BALANCES:
            this.getBalances(payload);
            break;
          case ZAP:
            this.governate(payload)
            break;
          case GET_BEST_PRICE:
            this.getBestPrice(payload)
            break;
          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return(this.store[index]);
  };

  setStore(obj) {
    this.store = {...this.store, ...obj}
    // console.log(this.store)
    return emitter.emit('StoreUpdated');
  };

  resetProfile = () => {
    const defaultvalues = this._getDefaultValues()

    store.setStore({
      assets: defaultvalues.assets,
    })
  }

  _getDefaultValues = () => {
    return {
      assets: [
        {
          id: 'DAIv3',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          investSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0xC2cB1040220768554cf699b0d863A3cd4324ce32',
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          decimals: 18,
          price: 0,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'dai'
        },
        {
          id: 'USDCv3',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD Coin',
          investSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          iEarnContract: '0x26EA744E5B887E5205727f55dFBE8685e3b21951',
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'usd-coin'
        },
        {
          id: 'USDTv3',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          investSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          iEarnContract: '0xE6354ed5bC4b393a5Aad09f21c46E101e692d447',
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'tether'
        },
        {
          id: 'BUSDv3',
          name: 'BUSD',
          symbol: 'BUSD',
          description: 'Binance USD',
          investSymbol: 'yBUSD',
          erc20address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
          iEarnContract: '0x04bC0Ab673d88aE9dbC9DA2380cB6B79C4BCa9aE',
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 3,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'binance-usd'
        },
        {
          id: 'DAIv2',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          investSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01',
          lastMeasurement: 9465912,
          measurement: 1000037230456849197,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          decimals: 18,
          price: 0,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'dai'
        },
        {
          id: 'USDCv2',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD Coin',
          investSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          iEarnContract: '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e',
          lastMeasurement: 9465880,
          measurement: 1139534904703193728,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'usd-coin'
        },
        {
          id: 'TUSDv2',
          name: 'TUSD',
          symbol: 'TUSD',
          description: 'TrueUSD',
          investSymbol: 'yTUSD',
          erc20address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          iEarnContract: '0x73a052500105205d34Daf004eAb301916DA8190f',
          lastMeasurement: 9479531,
          measurement: 1000197346651007837 ,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: true,
          price_id: 'true-usd',
        },
        {
          id: 'SUSDv2',
          name: 'SUSD',
          symbol: 'SUSD',
          description: 'Synth sUSD',
          investSymbol: 'ySUSD',
          erc20address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
          iEarnContract: '0xF61718057901F84C4eEC4339EF8f0D86D2B45600',
          lastMeasurement: 9465880,
          measurement: 1000021451644065970,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'nusd',
        },
        {
          id: 'wBTCv2',
          name: 'wBTC',
          symbol: 'wBTC',
          description: 'Wrapped BTC',
          investSymbol: 'yWBTC',
          erc20address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          iEarnContract: '0x04Aa51bbcB46541455cCF1B8bef2ebc5d3787EC9',
          lastMeasurement: 9465880,
          measurement: 999998358212140782,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 8,
          poolValue: 0,
          abi: config.IEarnErc20ABIv2,
          version: 2,
          disabled: false,
          invest: 'deposit',
          redeem: 'withdraw',
          curve: false,
          price_id: 'wrapped-bitcoin',
        },
        {
          id: 'DAIv1',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          investSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          iEarnContract: '0x9D25057e62939D3408406975aD75Ffe834DA4cDd',
          lastMeasurement: 9400732,
          measurement: 1000848185112260412,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          decimals: 18,
          price: 0,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'dai',
        },
        {
          id: 'USDCv1',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD Coin',
          investSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          iEarnContract: '0xa2609B2b43AC0F5EbE27deB944d2a399C201E3dA',
          lastMeasurement: 9400732,
          measurement: 1001761741440856097,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'usd-coin',
        },
        {
          id: 'USDTv1',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          investSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          iEarnContract: '0xa1787206d5b1bE0f432C4c4f96Dc4D1257A1Dd14',
          lastMeasurement: 9400732,
          measurement: 1085531657202472310,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 6,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'tether',
        },
        {
          id: 'wBTCv1',
          name: 'wBTC',
          symbol: 'wBTC',
          tokenSymbol: 'wBTC',
          description: 'Wrapped BTC',
          investSymbol: 'yBTC',
          erc20address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          iEarnContract: '0x04EF8121aD039ff41d10029c91EA1694432514e9',
          lastMeasurement: 9427488,
          measurement: 2000175540087812685,
          apr: 0,
          maxApr: 0,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 8,
          poolValue: 0,
          abi: config.IEarnERC20ABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          curve: false,
          price_id: 'wrapped-bitcoin',
        },
        {
          id: 'ETHv1',
          name: 'ETH',
          symbol: 'ETH',
          description: 'Ethereum',
          investSymbol: 'iETH',
          erc20address: 'Ethereum',
          iEarnContract: '0x9Dde7cdd09dbed542fC422d18d89A589fA9fD4C0',
          apr: 0,
          maxApr: 0,
          balance: 0,
          decimals: 18,
          investedBalance: 0,
          price: 0,
          poolValue: 0,
          abi: config.IEarnABI,
          version: 1,
          disabled: true,
          invest: 'invest',
          redeem: 'redeem',
          price_id: 'ethereum',
        },
        {
          id: 'iDAIv1',
          name: 'Fulcrum DAI iToken',
          symbol: 'iDAI',
          description: 'Fulcrum DAI iToken',
          erc20address: '0x493c57c4763932315a328269e1adad09653b9081',
          iEarnContract: null,
          balance: 0,
          investedBalance: 0,
          price: 0,
          decimals: 18,
          poolValue: 0,
          version: 2,
          disabled: true,
          idai: true,
          price_id: 'dai',
        },
      ],
      vaultAssets: [
        {
          id: 'YFI',
          name: 'yearn.finance',
          symbol: 'YFI',
          description: 'yearn.finance',
          vaultSymbol: 'yYFI',
          erc20address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
          vaultContractAddress: '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10695309,
          measurement: 1e18,
          price_id: 'yearn-finance',
        },
        {
          id: 'DAI',
          name: 'DAI',
          symbol: 'DAI',
          description: 'DAI Stablecoin',
          vaultSymbol: 'yDAI',
          erc20address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          vaultContractAddress: '0xACd43E627e64355f1861cEC6d3a6688B31a6F952',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10650116,
          measurement: 1e18,
          price_id: 'dai',
          yVaultCheckAddress: '0x1bbe0f9af0cf852f9ff14637da2f0bc477a6d1ad',
          yVaultCheckDisabled: true
        },
        {
          id: 'USDC',
          name: 'USD Coin',
          symbol: 'USDC',
          description: 'USD Coin',
          vaultSymbol: 'yUSDC',
          erc20address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          vaultContractAddress: '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e',
          vaultContractABI: config.vaultContractABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 6,
          deposit: true,
          depositAll: false,
          withdraw: true,
          withdrawAll: false,
          lastMeasurement: 10532708,
          measurement: 1e18,
          price_id: 'usd-coin',
        },
        {
          id: 'USDT',
          name: 'USDT',
          symbol: 'USDT',
          description: 'Tether USD',
          vaultSymbol: 'yUSDT',
          erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          vaultContractAddress: '0x2f08119C6f07c006695E079AAFc638b8789FAf18',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 6,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10651402,
          measurement: 1e18,
          price_id: 'tether',
        },
        {
          id: 'LINK',
          name: 'ChainLink',
          symbol: 'LINK',
          description: 'ChainLink',
          vaultSymbol: 'yLINK',
          erc20address: '0x514910771af9ca656af840dff83e8264ecf986ca',
          vaultContractAddress: '0x881b06da56BB5675c54E4Ed311c21E54C5025298',
          vaultContractABI: config.vaultContractV3ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          depositDisabled: true,
          lastMeasurement: 10604016,
          measurement: 1e18,
          price_id: 'chainlink',
        },
        {
          id: 'WETH',
          name: 'WETH',
          symbol: 'WETH',
          description: 'Wrapped Ether',
          vaultSymbol: 'yWETH',
          erc20address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          vaultContractAddress: '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
          vaultContractABI: config.vaultContractV4ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: true,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10774489,
          measurement: 1e18,
          depositDisabled: true,
          price_id: 'ethereum',
        },
        {
          id: 'ETH',
          name: 'ETH',
          symbol: 'ETH',
          description: 'Ether',
          vaultSymbol: 'yETH',
          erc20address: 'Ethereum',
          vaultContractAddress: '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
          vaultContractABI: config.vaultContractV4ABI,
          balance: 0,
          vaultBalance: 0,
          decimals: 18,
          deposit: true,
          depositAll: false,
          withdraw: true,
          withdrawAll: true,
          lastMeasurement: 10774489,
          measurement: 1e18,
          depositDisabled: true,
          price_id: 'ethereum',
        },
      ],
    }
  }


  _checkApproval = async (asset, account, amount, contract, callback) => {

    if(asset.erc20address === 'Ethereum') {
      return callback()
    }

    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    try {
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

      let ethAllowance = web3.utils.fromWei(allowance, "ether")
      if (asset.decimals !== 18) {
        ethAllowance = (allowance*10**asset.decimals).toFixed(0);
      }

      const amountToSend = MAX_UINT256;

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        /*
          code to accomodate for "assert _value == 0 or self.allowances[msg.sender][_spender] == 0" in contract
          We check to see if the allowance is > 0. If > 0 set to 0 before we set it to the correct amount.
        */
        if(['crvV1', 'crvV2', 'crvV3', 'crvV4', 'USDTv1', 'USDTv2', 'USDTv3', 'USDT', 'sCRV'].includes(asset.id) && ethAllowance > 0) {
          await erc20Contract.methods.approve(contract, web3.utils.toWei('0', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        }

        await erc20Contract.methods.approve(contract, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }
    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  _checkApprovalWaitForConfirmation = async (asset, account, amount, contract, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

    const ethAllowance = web3.utils.fromWei(allowance, "ether")

    if(parseFloat(ethAllowance) < parseFloat(amount)) {
      if(['crvV1', 'crvV2', 'crvV3', 'crvV4', 'USDTv1', 'USDTv2', 'USDTv3', 'sCRV'].includes(asset.id) && ethAllowance > 0) {
        erc20Contract.methods.approve(contract, web3.utils.toWei('0', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', async function(hash){
            erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
              .on('transactionHash', function(hash){
                callback()
              })
              .on('error', function(error) {
                if (!error.toString().includes("-32601")) {
                  if(error.message) {
                    return callback(error.message)
                  }
                  callback(error)
                }
              })
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      } else {
        erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', function(hash){
            callback()
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      }
    } else {
      callback()
    }
  }

  _callInvest = async (asset, account, amount, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    let iEarnContract = new web3.eth.Contract(asset.abi, asset.iEarnContract)
    if(asset.erc20address === 'Ethereum') {
      iEarnContract.methods[asset.invest]().send({ from: account.address, value: web3.utils.toWei(amount, "ether"), gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log(confirmationNumber, receipt);
        })
        .on('receipt', function(receipt){
          console.log(receipt);
        })
        .on('error', function(error) {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    } else {
      var amountToSend = web3.utils.toWei(amount, "ether")
      if (asset.decimals !== 18) {
        amountToSend = amount*10**asset.decimals;
      }
      iEarnContract.methods[asset.invest](amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          console.log(hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log(confirmationNumber, receipt);
        })
        .on('receipt', function(receipt){
          console.log(receipt);
        })
        .on('error', function(error) {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
        .catch((error) => {
          if (!error.toString().includes("-32601")) {
            if(error.message) {
              return callback(error.message)
            }
            callback(error)
          }
        })
    }
  }



  getBalancesLight = async () => {
    const account = store.getStore('account')

    const assets = store.getStore('assets')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider();
    if(!web3) {
      return null
    }

    async.map(assets, (asset, callback) => {
      async.parallel([
        (callbackInner) => { this._getERC20Balance(web3, asset, account, callbackInner) },
        (callbackInner) => { this._getInvestedBalance(web3, asset, account, callbackInner) },
        (callbackInner) => { this._getPoolPrice(web3, asset, account, callbackInner) },
        (callbackInner) => { this._getMaxAPR(web3, asset, account, callbackInner) },
      ], (err, data) => {
        asset.balance = data[0]
        asset.investedBalance = data[1]
        asset.price = data[2]
        asset.maxApr = data[3]

        callback(null, asset)
      })
    }, (err, assets) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      store.setStore({ assets: assets })
      return emitter.emit(BALANCES_LIGHT_RETURNED, assets)
    })
  }

  getBalances = async () => {
    const account = store.getStore('account')

    const assets = store.getStore('assets')

    if(!account || !account.address) {
      return false
    }

    const web3 = new Web3(store.getStore('web3context').library.provider);

    async.map(assets, (asset, callback) => {
      async.parallel([
        (callbackInner) => { this._getERC20Balance(web3, asset, account, callbackInner) },
        (callbackInner) => { this._getPoolPrice(web3, asset, account, callbackInner) },
        (callbackInner) => { this._getPoolValue(web3, asset, account, callbackInner) },
        (callbackInner) => { this._getBalance(web3, asset, account, callbackInner) },
      ], (err, data) => {
        asset.balance = data[0]
        asset.price = data[2]
        asset.poolValue = data[4]
        asset.current = data[6]
        asset.recommended = data[7]
        asset.tokenBalance = data[8]

        callback(null, asset)
      })
    }, (err, assets) => {
      if(err) {
        return emitter.emit(ERROR, err)
      }

      store.setStore({ assets: assets })
      return emitter.emit(BALANCES_RETURNED, assets)
    })
  }

  _getERC20Balance = async (web3, asset, account, callback) => {

    if(asset.erc20address === 'Ethereum') {
      try {
        const eth_balance = web3.utils.fromWei(await web3.eth.getBalance(account.address), "ether");
        callback(null, parseFloat(eth_balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    } else {
      let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)

      try {
        var balance = await erc20Contract.methods.balanceOf(account.address).call({ from: account.address });
        balance = parseFloat(balance)/10**asset.decimals
        callback(null, parseFloat(balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    }
  }

  _getBalance = async (web3, asset, account, callback) => {

    if(asset.iEarnContract === null) {
      return callback(null, 0)
    }

    if(asset.erc20address === 'Ethereum') {
      try {
        const eth_balance = web3.utils.fromWei(await web3.eth.getBalance(asset.iEarnContract), "ether");
        callback(null, parseFloat(eth_balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    } else {
      let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)

      try {
        var balance = await erc20Contract.methods.balanceOf(asset.iEarnContract).call({ from: account.address });
        balance = parseFloat(balance)/10**asset.decimals
        callback(null, parseFloat(balance))
      } catch(ex) {
        console.log(ex)
        return callback(ex)
      }
    }
  }


  _getPoolValue = async (web3, asset, account, callback) => {

    if(asset.iEarnContract === null) {
      return callback(null, 0)
    }

    try {
      let iEarnContract = new web3.eth.Contract(asset.abi, asset.iEarnContract)
      let value = 0

      if(asset.erc20address === 'Ethereum') {
        value = web3.utils.fromWei(await iEarnContract.methods.calcPoolValueInETH().call({ from: account.address }), 'ether');
      } else {
        value = await iEarnContract.methods.calcPoolValueInToken().call({ from: account.address });
        if (asset.decimals === 18) {
          value = web3.utils.fromWei(value, 'ether');
        } else {
          value = value / (10 ** asset.decimals);
        }
      }
      callback(null, parseFloat(value))
    } catch (e) {
      console.log(e)
      callback(null, 0)
    }

  }

  _getPoolPrice = async (web3, asset, account, callback) => {

    if(asset.iEarnContract === null) {
      return callback(null, 0)
    }

    let iEarnContract = new web3.eth.Contract(config.IEarnABI, asset.iEarnContract)
    const balance = web3.utils.fromWei(await iEarnContract.methods.getPricePerFullShare().call({ from: account.address }), 'ether');
    callback(null, parseFloat(balance))
  }

  _getTransaction = async (web3, hash) => {
    const rawTx = await web3.eth.getTransaction(hash)
    return rawTx
  }

  _getPricePerFullShare = async (web3, iEarnContract) => {
    const balance = web3.utils.fromWei(await iEarnContract.methods.getPricePerFullShare().call({ }), 'ether');
    return balance
  }

  _getIEthBalance = async (web3, iEarnContract, address) => {
    const balance = web3.utils.fromWei(await iEarnContract.methods.balanceOf(address).call({ }), 'ether');
    return balance
  }

  getBestPrice = (payload) => {
    const account = store.getStore('account')
    const { sendAsset, receiveAsset, amount } = payload.content

    this._getBestPrice(sendAsset, receiveAsset, account, amount, (err, price) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      return emitter.emit(GET_BEST_PRICE_RETURNED, price)
    })
  }

  _getBestPrice = async (sendAsset, receiveAsset, account, amount, callback) => {
    try {
      const url = 'https://api-v2.dex.ag/price?from='+sendAsset.symbol.toLowerCase()+'&to='+receiveAsset.symbol.toLowerCase()+'&fromAmount='+amount+'&dex=ag&tradable=true'
      let price = await rp(url);
      callback(null, JSON.parse(price));
    } catch(e) {
      callback(null, {})
    }
  }


  _getDexAgTrade = async (sendAsset, receiveAsset, account, amount) => {
    const url = 'https://api-v2.dex.ag/trade?from='+sendAsset.symbol.toLowerCase()+'&to='+receiveAsset.symbol.toLowerCase()+'&fromAmount='+amount+'&dex=ag'
    let trade = await rp(url);
    return JSON.parse(trade);
  }

  _approveToken = async (token, spender, amount, account, web3) => {
    // First 4 bytes of the hash of "fee()" for the sighash selector
    let funcHash = ethers.utils.hexDataSlice(ethers.utils.id('approve(address,uint256)'), 0, 4);

    let abi = new ethers.utils.AbiCoder();
    let inputs = [{
      name: 'spender',
      type: 'address'
    }, {
      name: 'amount',
      type: 'uint256'
    }];

    let params = [spender, amount];
    let bytes = abi.encode(inputs, params).substr(2);

    // construct approval data from function hash and parameters
    let inputData = `${funcHash}${bytes}`;

    // let nonce = await infuraProvider.getTransactionCount(ethersWallet.address);
    let nonce = await web3.eth.getTransactionCount(account.address)

    // You will want to get the real gas price from https://ethgasstation.info/json/ethgasAPI.json
    let gasPrice = web3.utils.toWei(await this._getGasPrice(), 'gwei');

    let transaction = {
      to: token,
      nonce: nonce,
      gasLimit: 500000, // You will want to use estimateGas instead for real apps
      gasPrice: gasPrice,
      data: inputData,
      from: account.address
    }

    // let tx = await ethersWallet.sendTransaction(transaction);
    let tx = await web3.eth.sendTransaction(transaction)
    console.log(tx);
  }

  governate = (payload) => {
    const account = store.getStore('account')
    const { sendAsset, receiveAsset, amount } = payload.content

    let contractAddress = ''

    if(receiveAsset.id === 'crvV3') {
      contractAddress = config.yCurveGovernateAddress
    }
    if(receiveAsset.id === 'crvV4') {
      contractAddress = config.yCurveGovernateV4Address
    }
    if(sendAsset.id === 'crvV3') {
      contractAddress = config.yCurveGovernateOutAddress
    }
    if(sendAsset.id === 'crvV4') {
      contractAddress = config.yCurveGovernateOutV4Address
    }

    this._checkApproval(sendAsset, account, amount, contractAddress, (err) => {
      if(err) {
        return emitter.emit(ERROR, err);
      }

      this._callGovernate(sendAsset, receiveAsset, account, amount, (err, governateResult) => {
        if(err) {
          return emitter.emit(ERROR, err);
        }

        return emitter.emit(ZAP_RETURNED, governateResult)
      })
    })
  }

  _callGovernate = async (sendAsset, receiveAsset, account, amount, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);

    var amountToSend = web3.utils.toWei(amount, "ether")
    if (sendAsset.decimals !== 18) {
      amountToSend = amount*10**sendAsset.decimals;
    }

    let yCurveGovernateContract = null
    if(receiveAsset.id === 'crvV3') {
      yCurveGovernateContract = new web3.eth.Contract(config.yCurveGovernateABI, config.yCurveGovernateAddress)
    } else if(receiveAsset.id === 'crvV4') {
      yCurveGovernateContract = new web3.eth.Contract(config.yCurveGovernateV4ABI, config.yCurveGovernateV4Address)
    } else if(sendAsset.id === 'crvV3') {
      yCurveGovernateContract = new web3.eth.Contract(config.yCurveGovernateOutABI, config.yCurveGovernateOutAddress)
    } else if(sendAsset.id === 'crvV4') {
      yCurveGovernateContract = new web3.eth.Contract(config.yCurveGovernateOutV4ABI, config.yCurveGovernateOutV4Address)
    }
    let call = ''

    switch (sendAsset.id) {
      case 'DAIv2':
      case 'DAIv3':
        call = 'depositDAI'
        break;
      case 'USDCv2':
      case 'USDCv3':
        call = 'depositUSDC'
        break;
      case 'USDTv2':
      case 'USDTv3':
        call = 'depositUSDT'
        break;
      case 'TUSDv2':
        call = 'depositTUSD'
        break;
      case 'BUSDv3':
        call = 'depositBUSD'
        break;
      case 'crvV3':
      case 'crvV4':
        switch (receiveAsset.id) {
          case 'DAIv2':
          case 'DAIv3':
            call = 'withdrawDAI'
            break;
          case 'USDCv2':
          case 'USDCv3':
            call = 'withdrawUSDC'
            break;
          case 'USDTv2':
          case 'USDTv3':
            call = 'withdrawUSDT'
            break;
          case 'TUSDv2':
            call = 'withdrawTUSD'
            break;
          case 'BUSDv3':
            call = 'withdrawBUSD'
            break;
          default:

        }
        break;
      default:
    }

    yCurveGovernateContract.methods[call](amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        console.log(hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        console.log(confirmationNumber, receipt);
      })
      .on('receipt', function(receipt){
        console.log(receipt);
      })
      .on('error', function(error) {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
      .catch((error) => {
        if (!error.toString().includes("-32601")) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        }
      })
  }

  _checkIfApprovalIsNeeded = async (asset, account, amount, contract, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

    const ethAllowance = web3.utils.fromWei(allowance, "ether")
    if(parseFloat(ethAllowance) < parseFloat(amount)) {
      asset.amount = amount
      callback(null, asset)
    } else {
      callback(null, false)
    }
  }

  _callApproval = async (asset, account, amount, contract, last, callback) => {
    const web3 = new Web3(store.getStore('web3context').library.provider);
    let erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
    try {
      if(['crvV1', 'crvV2', 'crvV3', 'crvV4', 'USDTv1', 'USDTv2', 'USDTv3', 'USDT'].includes(asset.id)) {
        const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })
        const ethAllowance = web3.utils.fromWei(allowance, "ether")
        if(ethAllowance > 0) {
          erc20Contract.methods.approve(contract, web3.utils.toWei('0', "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
            .on('transactionHash', function(hash){
              //success...
            })
            .on('error', function(error) {
              if (!error.toString().includes("-32601")) {
                if(error.message) {
                  return callback(error.message)
                }
                callback(error)
              }
            })
        }
      }

      if(last) {
        await erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        erc20Contract.methods.approve(contract, web3.utils.toWei(amount, "ether")).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
          .on('transactionHash', function(hash){
            callback()
          })
          .on('error', function(error) {
            if (!error.toString().includes("-32601")) {
              if(error.message) {
                return callback(error.message)
              }
              callback(error)
            }
          })
      }
    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  getUSDPrices = async () => {
    try {
      const priceJSON = await this._getUSDPrices()

      store.setStore({ usdPrices: priceJSON })
      return emitter.emit(USD_PRICE_RETURNED, priceJSON)

    } catch(e) {
      console.log(e)
    }
  }

  _getUSDPrices = async () => {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,dai,true-usd,tether,usd-coin,chainlink,yearn-finance,binance-usd,wrapped-bitcoin,ethereum,nusd,chainlink,aave-link,lp-sbtc-curve,lp-bcurve,curve-fi-ydai-yusdc-yusdt-ytusd,lp-3pool-curve,gemini-dollar,curve-dao-token&vs_currencies=usd,eth'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)

      return priceJSON
    } catch(e) {
      console.log(e)
      return null
    }
  }

  _getETHUSDPrices = async () => {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)

      return priceJSON.ethereum.usd
    } catch(e) {
      console.log(e)
      return null
    }
  }

   _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url);
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch(e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }

  _getWeb3Provider = async () => {
    const web3context = store.getStore('web3context')
    if(!web3context) {
      return null
    }
    const provider = web3context.library.provider
    if(!provider) {
      return null
    }

    const web3 = new Web3(provider);

    // const web3 = createAlchemyWeb3(config.infuraProvider, { writeProvider: provider });

    return web3
  }

  _getAllMarkets = async (web3) => {
    const comptrollerContract = new web3.eth.Contract(config.comptrollerContractABI, config.comptrollerContractAddress)

    const allMarkets = await comptrollerContract.methods.getAllMarkets().call()

    return allMarkets
  }

  _getAssetsIn = async (web3, account) => {
    const comptrollerContract = new web3.eth.Contract(config.comptrollerContractABI, config.comptrollerContractAddress)

    const assetsIn = await comptrollerContract.methods.getAssetsIn(account.address).call()

    return assetsIn
  }
}

var store = new Store();

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
};
