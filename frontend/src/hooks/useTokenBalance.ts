import { useReadContract, useAccount } from 'wagmi';
import { ERC20_ABI } from '../abis';
import { useEffect, useState } from 'react';

export function useTokenBalance(tokenAddress?: `0x${string}`) {
  const { address } = useAccount();
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  
  const isNativeToken = !tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';
  
  const { data: tokenBalance, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && !!tokenAddress && !isNativeToken,
    },
  });
  
  useEffect(() => {
    if (isNativeToken) {
      // For native ETH, we'd need to use useBalance from wagmi
      setBalance(BigInt(0));
    } else if (tokenBalance !== undefined) {
      setBalance(tokenBalance);
    }
  }, [tokenBalance, isNativeToken]);
  
  return {
    balance,
    refetch,
    isLoading: !isNativeToken && tokenBalance === undefined,
  };
}
