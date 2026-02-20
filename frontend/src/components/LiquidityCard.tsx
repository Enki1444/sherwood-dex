import { useState, useCallback, type ChangeEvent } from 'react';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { TokenSelectorModal } from './TokenSelectorModal';
import { ERC20_ABI, ROUTER_ABI } from '../abis';
import contracts from '../config/contracts.json';
import type { Token } from '../store';
import { getDeadline } from '../utils';

const NATIVE_TOKEN: Token = {
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
};

export function LiquidityCard() {
  const { address, isConnected } = useAccount();
  const [tokenA, setTokenA] = useState<Token>(NATIVE_TOKEN);
  const [tokenB, setTokenB] = useState<Token | null>(null);
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [showTokenSelector, setShowTokenSelector] = useState<'A' | 'B' | null>(null);
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [lpAmount, setLpAmount] = useState('');

  // Get balances
  const { data: balanceA } = useReadContract({
    address: tokenA.address !== NATIVE_TOKEN.address ? (tokenA.address as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && tokenA.address !== NATIVE_TOKEN.address },
  });

  const { data: balanceB } = useReadContract({
    address: tokenB && tokenB.address !== NATIVE_TOKEN.address ? (tokenB.address as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenB && tokenB.address !== NATIVE_TOKEN.address },
  });

  // Get allowances
  const { data: allowanceA } = useReadContract({
    address: tokenA.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && tokenA.address !== NATIVE_TOKEN.address 
      ? [address, contracts.contracts.SherwoodRouter02 as `0x${string}`]
      : undefined,
    query: { enabled: !!address && tokenA.address !== NATIVE_TOKEN.address },
  });

  const { data: allowanceB } = useReadContract({
    address: tokenB?.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && tokenB && tokenB.address !== NATIVE_TOKEN.address 
      ? [address, contracts.contracts.SherwoodRouter02 as `0x${string}`]
      : undefined,
    query: { enabled: !!address && !!tokenB && tokenB.address !== NATIVE_TOKEN.address },
  });

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const formatBalanceDisplay = (val: bigint | undefined, decimals: number) => {
    if (!val) return '0';
    return parseFloat(formatUnits(val, decimals)).toFixed(4);
  };

  const handleApprove = useCallback(async (token: Token) => {
    if (!address || token.address === NATIVE_TOKEN.address) return;
    const amount = parseUnits('1000000000000000000000000', token.decimals);
    writeContract({
      address: token.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contracts.contracts.SherwoodRouter02 as `0x${string}`, amount],
    });
  }, [address, writeContract]);

  const handleAddLiquidity = useCallback(async () => {
    if (!tokenB || !amountA || !amountB || !address) return;

    const amountADesired = parseUnits(amountA, tokenA.decimals);
    const amountBDesired = parseUnits(amountB, tokenB.decimals);
    const amountAMin = (amountADesired * BigInt(95)) / BigInt(100);
    const amountBMin = (amountBDesired * BigInt(95)) / BigInt(100);
    const deadline = getDeadline(20);

    if (tokenA.address === NATIVE_TOKEN.address) {
      writeContract({
        address: contracts.contracts.SherwoodRouter02 as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'addLiquidityETH',
        args: [
          tokenB.address as `0x${string}`,
          amountBDesired,
          amountBMin,
          amountAMin,
          address,
          deadline,
        ],
        value: amountADesired,
      });
    } else {
      writeContract({
        address: contracts.contracts.SherwoodRouter02 as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'addLiquidity',
        args: [
          tokenA.address as `0x${string}`,
          tokenB.address as `0x${string}`,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          address,
          deadline,
        ],
      });
    }
  }, [tokenA, tokenB, amountA, amountB, address, writeContract]);

  const handleRemoveLiquidity = useCallback(async () => {
    // Implement remove liquidity
  }, []);

  const needsApprovalA = tokenA.address !== NATIVE_TOKEN.address && 
    allowanceA !== undefined && 
    parseUnits(amountA || '0', tokenA.decimals) > (allowanceA as bigint);
  
  const needsApprovalB = tokenB && tokenB.address !== NATIVE_TOKEN.address && 
    allowanceB !== undefined && 
    parseUnits(amountB || '0', tokenB.decimals) > (allowanceB as bigint);

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Liquidity</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('add')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              mode === 'add' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              mode === 'remove' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Minus className="w-4 h-4 inline mr-1" /> Remove
          </button>
        </div>
      </div>

      {mode === 'add' ? (
        <>
          <div className="bg-gray-800 rounded-2xl p-4 mb-2">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Token A</span>
              <span>Balance: {formatBalanceDisplay(balanceA as bigint | undefined, tokenA.decimals)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTokenSelector('A')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                <span className="font-medium text-white">{tokenA.symbol}</span>
              </button>
              <input
                type="number"
                value={amountA}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountA(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-right text-2xl font-medium text-white outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4 mt-2">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Token B</span>
              <span>Balance: {tokenB ? formatBalanceDisplay(balanceB as bigint | undefined, tokenB.decimals) : '-'}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTokenSelector('B')}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
                <span className="font-medium text-white">{tokenB?.symbol || 'Select'}</span>
              </button>
              <input
                type="number"
                value={amountB}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountB(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-transparent text-right text-2xl font-medium text-white outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {needsApprovalA && (
              <button
                onClick={() => handleApprove(tokenA)}
                disabled={isWritePending || isConfirming}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl font-bold text-lg text-white transition-all disabled:opacity-50"
              >
                {isWritePending ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `Approve ${tokenA.symbol}`}
              </button>
            )}
            {needsApprovalB && tokenB && (
              <button
                onClick={() => handleApprove(tokenB)}
                disabled={isWritePending || isConfirming}
                className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl font-bold text-lg text-white transition-all disabled:opacity-50"
              >
                {isWritePending ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `Approve ${tokenB.symbol}`}
              </button>
            )}
            {!needsApprovalA && !needsApprovalB && (
              <button
                onClick={handleAddLiquidity}
                disabled={!isConnected || isWritePending || isConfirming || !amountA || !amountB || !tokenB}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl font-bold text-lg text-white transition-all disabled:cursor-not-allowed"
              >
                {isWritePending || isConfirming ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isConfirming ? 'Confirming...' : 'Pending...'}
                  </span>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : (
                  'Add Liquidity'
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>LP Tokens to Remove</span>
          </div>
          <input
            type="number"
            value={lpAmount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLpAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-transparent text-2xl font-medium text-white outline-none"
          />
          <button
            onClick={handleRemoveLiquidity}
            disabled={!isConnected || isWritePending || isConfirming || !lpAmount}
            className="w-full mt-4 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl font-bold text-lg text-white transition-all disabled:cursor-not-allowed"
          >
            Remove Liquidity
          </button>
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center">
          Transaction successful! 🎉
        </div>
      )}

      <TokenSelectorModal
        isOpen={showTokenSelector !== null}
        onClose={() => setShowTokenSelector(null)}
        onSelect={(token) => {
          if (showTokenSelector === 'A') setTokenA(token);
          else setTokenB(token);
        }}
        excludeToken={showTokenSelector === 'A' ? tokenB || undefined : tokenA}
      />
    </div>
  );
}
