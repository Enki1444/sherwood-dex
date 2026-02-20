import { formatUnits, parseUnits, isAddress } from 'viem';

export const formatBalance = (balance: bigint | undefined, decimals: number = 18): string => {
  if (!balance) return '0';
  return parseFloat(formatUnits(balance, decimals)).toLocaleString('en-US', {
    maximumFractionDigits: 6,
  });
};

export const parseAmount = (amount: string, decimals: number = 18): bigint => {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
};

export const getAmountOut = (
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint => {
  if (amountIn === BigInt(0) || reserveIn === BigInt(0) || reserveOut === BigInt(0)) {
    return BigInt(0);
  }
  
  const amountInWithFee = amountIn * BigInt(997);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * BigInt(1000) + amountInWithFee;
  
  return numerator / denominator;
};

export const getAmountIn = (
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint => {
  if (amountOut === BigInt(0) || reserveIn === BigInt(0) || reserveOut === BigInt(0)) {
    return BigInt(0);
  }
  
  const numerator = reserveIn * amountOut * BigInt(1000);
  const denominator = (reserveOut - amountOut) * BigInt(997);
  
  return numerator / denominator + BigInt(1);
};

export const calculatePriceImpact = (
  amountIn: bigint,
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): number => {
  if (reserveIn === BigInt(0) || reserveOut === BigInt(0)) return 0;
  
  const midPrice = Number(reserveOut) / Number(reserveIn);
  const executionPrice = Number(amountOut) / Number(amountIn);
  
  if (midPrice === 0) return 0;
  
  return ((midPrice - executionPrice) / midPrice) * 100;
};

export const getDeadline = (minutes: number): bigint => {
  return BigInt(Math.floor(Date.now() / 1000 + minutes * 60));
};

export const isValidAddress = (address: string): boolean => {
  return isAddress(address);
};

export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

export const getExplorerUrl = (
  chainId: number,
  hash: string,
  type: 'tx' | 'address' | 'token' = 'tx'
): string => {
  const explorers: Record<number, string> = {
    46630: 'https://explorer.testnet.chain.robinhood.com',
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
  };
  
  const baseUrl = explorers[chainId] || explorers[1];
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`;
    case 'address':
      return `${baseUrl}/address/${hash}`;
    case 'token':
      return `${baseUrl}/token/${hash}`;
    default:
      return baseUrl;
  }
};

export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const calculateLPTokenAmount = (
  amount0: bigint,
  amount1: bigint,
  reserve0: bigint,
  reserve1: bigint,
  totalSupply: bigint
): bigint => {
  if (totalSupply === BigInt(0)) {
    // First liquidity provider
    return sqrt(amount0 * amount1) - BigInt(1000);
  }
  
  // Subsequent liquidity providers
  const liquidity0 = (amount0 * totalSupply) / reserve0;
  const liquidity1 = (amount1 * totalSupply) / reserve1;
  
  return liquidity0 < liquidity1 ? liquidity0 : liquidity1;
};

const sqrt = (y: bigint): bigint => {
  if (y > BigInt(3)) {
    let z = y;
    let x = y / BigInt(2) + BigInt(1);
    while (x < z) {
      z = x;
      x = (y / x + x) / BigInt(2);
    }
    return z;
  } else if (y !== BigInt(0)) {
    return BigInt(1);
  }
  return BigInt(0);
};
