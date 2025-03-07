import { TokenInfo } from '@l2beat/config'
import { BigNumber } from 'ethers'

import { TEN_TO_18 } from '../../../constants'
import { ProjectInfo } from '../../../model'
import { FetchedBalances, FetchedPrices } from '../model'

export interface TokenStats {
  token: TokenInfo
  balance: BigNumber
  value: BigNumber
}

export function getTokenStats(
  project: ProjectInfo,
  balances: FetchedBalances,
  prices: FetchedPrices
): TokenStats[] {
  const holders = getHolderAddresses(project)
  const tokens = getTrackedTokens(project)

  const stats = tokens.map((token) => {
    const balance = getTokenBalance(holders, token, balances)
    const price = getTokenPrice(token, prices)
    const value = balance.mul(price).div(TEN_TO_18)
    return { token, balance, value }
  })
  return stats
}

export function getHolderAddresses(project: ProjectInfo) {
  return project.bridges.map((bridge) => bridge.address)
}

export function getTrackedTokens(project: ProjectInfo) {
  return project.bridges
    .flatMap((bridge) => bridge.tokens)
    .filter((x, i, a) => a.indexOf(x) === i)
}

export function getTokenBalance(
  holders: string[],
  token: TokenInfo,
  balances: FetchedBalances
) {
  let balance = BigNumber.from(0)
  for (const holder of holders) {
    const holderBalance = token.address
      ? balances.token[token.address]?.[holder]
      : balances.eth[holder]
    if (holderBalance) {
      balance = balance.add(holderBalance)
    }
  }
  return balance
}

export function getTokenPrice(token: TokenInfo, prices: FetchedPrices) {
  return token.address
    ? prices.token[token.address] ?? BigNumber.from(0)
    : prices.eth
}
