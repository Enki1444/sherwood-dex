import { useState, useCallback, type ChangeEvent } from 'react';
import { ArrowUpDown, Settings, Loader2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { TokenSelectorModal } from './TokenSelectorModal';
import { ERC20_ABI, ROUTER_ABI } from '../abis';
import contracts from '../config/contracts.json';
import type { Token } from '../store';
import { getDeadline, calculatePriceImpact } from '../utils';

const NATIVE_TOKEN: Token = {
  address: '0x0000000000000000000000000000000000000000',
  symbol: 'ETH',
  name: 'Ether',
  decimals: 18,
};

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const [tokenIn, setTokenIn] = useState<Token>(NATIVE_TOKEN);
  const [tokenOut, setTokenOut] = useState<Token | null>(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showTokenSelector, setShowTokenSelector] = useState<'in' | 'out' | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Get token balance using readContract
  const { data: tokenInBalance } = useReadContract({
    address: tokenIn.address !== NATIVE_TOKEN.address ? (tokenIn.address as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && tokenIn.address !== NATIVE_TOKEN.address },
  });

  // Get allowance
  const { data: allowance } = useReadContract({
    address: tokenIn.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && tokenIn.address !== NATIVE_TOKEN.address 
      ? [address, contracts.contracts.SherwoodRouter02 as `0x${string}`]
      : undefined,
    query: { enabled: !!address && tokenIn.address !== NATIVE_TOKEN.address },
  });

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const balance = tokenIn.address === NATIVE_TOKEN.address 
    ? BigInt(0) // Would need useBalance for native token
    : (tokenInBalance as bigint) || BigInt(0);

  const formatBalanceDisplay = (val: bigint, decimals: number) => {
    if (val === BigInt(0)) return '0';
    return parseFloat(formatUnits(val, decimals)).toFixed(4);
  };

  const handleSwap = useCallback(async () => {
    if (!tokenOut || !amountIn || !address) return;

    const amountInWei = parseUnits(amountIn, tokenIn.decimals);
    const amountOutWei = parseUnits(amountOut, tokenOut.decimals);
    const amountOutMin = (amountOutWei * BigInt(Math.floor((1 - parseFloat(slippage) / 100) * 10000))) / BigInt(10000);
    const deadline = getDeadline(20);

    if (tokenIn.address === NATIVE_TOKEN.address) {
      writeContract({
        address: contracts.contracts.SherwoodRouter02 as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [
          amountOutMin,
          [NATIVE_TOKEN.address as `0x${string}`, tokenOut.address as `0x${string}`],
          address,
          deadline,
        ],
        value: amountInWei,
      });
    } else if (tokenOut.address === NATIVE_TOKEN.address) {
      writeContract({
        address: contracts.contracts.SherwoodRouter02 as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [
          amountInWei,
          amountOutMin,
          [tokenIn.address as `0x${string}`, NATIVE_TOKEN.address as `0x${string}`],
          address,
          deadline,
        ],
      });
    } else {
      writeContract({
        address: contracts.contracts.SherwoodRouter02 as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          amountInWei,
          amountOutMin,
          [tokenIn.address as `0x${string}`, tokenOut.address as `0x${string}`],
          address,
          deadline,
        ],
      });
    }
  }, [tokenIn, tokenOut, amountIn, amountOut, slippage, address, writeContract]);

  const handleApprove = useCallback(async () => {
    if (!address || tokenIn.address === NATIVE_TOKEN.address) return;
    const amount = parseUnits(amountIn || '0', tokenIn.decimals);
    writeContract({
      address: tokenIn.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contracts.contracts.SherwoodRouter02 as `0x${string}`, amount],
    });
  }, [address, tokenIn, amountIn, writeContract]);

  const needsApproval = tokenIn.address !== NATIVE_TOKEN.address && 
    allowance !== undefined && 
    parseUnits(amountIn || '0', tokenIn.decimals) > (allowance as bigint);

  const priceImpact = calculatePriceImpact(
    parseUnits(amountIn || '0', tokenIn.decimals),
    parseUnits(amountOut || '0', tokenOut?.decimals || 18),
    BigInt(0), // Would need reserves for accurate calculation
    BigInt(0)
  );

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-emerald-500/20 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Swap</h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-gray-800 rounded-xl">
          <label className="text-sm text-gray-400 mb-2 block">Slippage Tolerance (%)</label>
          <input
            type="number"
            value={slippage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSlippage(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
            placeholder="0.5"
          />
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl p-4 mb-2">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>From</span>
          <span>Balance: {formatBalanceDisplay(balance, tokenIn.decimals)}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTokenSelector('in')}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-xl px-4 py-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
            <span className="font-medium text-white">{tokenIn.symbol}</span>
          </button>
          <input
            type="number"
            value={amountIn}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-right text-2xl font-medium text-white outline-none"
          />
        </div>
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={() => {
            const temp = tokenIn;
            setTokenIn(tokenOut || NATIVE_TOKEN);
            setTokenOut(temp);
            setAmountIn(amountOut);
            setAmountOut('');
          }}
          className="bg-gray-800 border-4 border-gray-900 rounded-xl p-2 hover:bg-gray-700"
        >
          <ArrowUpDown className="w-5 h-5 text-emerald-400" />
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4 mt-2">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>To</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTokenSelector('out')}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-xl px-4 py-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
            <span className="font-medium text-white">{tokenOut?.symbol || 'Select'}</span>
          </button>
          <input
            type="number"
            value={amountOut}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountOut(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-right text-2xl font-medium text-white outline-none"
          />
        </div>
      </div>

      {priceImpact > 5 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          High price impact: {priceImpact.toFixed(2)}%
        </div>
      )}

      <button
        onClick={needsApproval ? handleApprove : handleSwap}
        disabled={!isConnected || isWritePending || isConfirming || !amountIn || !tokenOut}
        className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl font-bold text-lg text-white transition-all disabled:cursor-not-allowed"
      >
        {isWritePending || isConfirming ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {isConfirming ? 'Confirming...' : 'Pending...'}
          </span>
        ) : !isConnected ? (
          'Connect Wallet'
        ) : needsApproval ? (
          `Approve ${tokenIn.symbol}`
        ) : (
          'Swap'
        )}
      </button>

      {isSuccess && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center">
          Swap successful! 🎉
        </div>
      )}

      <TokenSelectorModal
        isOpen={showTokenSelector !== null}
        onClose={() => setShowTokenSelector(null)}
        onSelect={(token) => {
          if (showTokenSelector === 'in') setTokenIn(token);
          else setTokenOut(token);
        }}
        excludeToken={showTokenSelector === 'in' ? tokenOut || undefined : tokenIn}
      />
    </div>
  );
}
