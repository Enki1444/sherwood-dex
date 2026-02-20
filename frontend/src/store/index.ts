import { create } from 'zustand';
import contracts from '../config/contracts.json';

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isCustom?: boolean;
}

interface SherwoodState {
  tokens: Token[];
  selectedTokenIn: Token | null;
  selectedTokenOut: Token | null;
  slippage: string;
  error: string | null;
  
  setSelectedTokenIn: (token: Token | null) => void;
  setSelectedTokenOut: (token: Token | null) => void;
  setSlippage: (slippage: string) => void;
  addToken: (token: Token) => void;
  setError: (error: string | null) => void;
}

const DEFAULT_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    name: 'Ether',
    decimals: 18,
  },
  {
    address: contracts.contracts.TREES || '0x0000000000000000000000000000000000000000',
    symbol: 'TREES',
    name: 'Sherwood Trees',
    decimals: 18,
  },
  {
    address: contracts.contracts.WETH || '0x0000000000000000000000000000000000000000',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
];

export const useSherwoodStore = create<SherwoodState>((set) => ({
  tokens: DEFAULT_TOKENS,
  selectedTokenIn: null,
  selectedTokenOut: null,
  slippage: '0.5',
  error: null,
  
  setSelectedTokenIn: (token) => set({ selectedTokenIn: token }),
  setSelectedTokenOut: (token) => set({ selectedTokenOut: token }),
  setSlippage: (slippage) => set({ slippage }),
  setError: (error) => set({ error }),
  
  addToken: (token) =>
    set((state) => ({
      tokens: state.tokens.some((t) => t.address.toLowerCase() === token.address.toLowerCase())
        ? state.tokens
        : [...state.tokens, token],
    })),
}));
