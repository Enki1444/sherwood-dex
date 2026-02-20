import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { FACTORY_ABI } from '../abis';
import contracts from '../config/contracts.json';
import type { Token } from '../store';

export interface Pair {
  address: string;
  token0: Token;
  token1: Token;
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
  tvl: string;
  volume24h: string;
}

export function usePairs() {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: pairsLength } = useReadContract({
    address: contracts.contracts.SherwoodFactory as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: 'allPairsLength',
  });

  useEffect(() => {
    async function fetchPairs() {
      if (!pairsLength) return;
      
      // For now, use mock data since we don't have deployed contracts
      const mockPairs: Pair[] = [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          token0: { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 },
          token1: { address: '0xabcdefabcdefabcdefabcdefabcdefabcdef', symbol: 'TREES', name: 'Trees Token', decimals: 18 },
          reserve0: BigInt('1000000000000000000'),
          reserve1: BigInt('2000000000000000000000'),
          totalSupply: BigInt('44721359549995793928'),
          tvl: '125,420',
          volume24h: '45,230',
        },
      ];
      
      setPairs(mockPairs);
      setLoading(false);
    }
    
    fetchPairs();
  }, [pairsLength]);

  return { pairs, loading };
}
