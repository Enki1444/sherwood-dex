import { useState, type ChangeEvent } from 'react';
import { X, Search, Plus } from 'lucide-react';
import type { Token } from '../store';

interface TokenSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  excludeToken?: Token;
}

export function TokenSelectorModal({ isOpen, onClose, onSelect, excludeToken }: TokenSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [tokens] = useState<Token[]>([
    { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ether', decimals: 18 },
  ]);
  const [customAddress, setCustomAddress] = useState('');

  const filteredTokens = tokens.filter(token => 
    token.address !== excludeToken?.address &&
    (token.symbol.toLowerCase().includes(search.toLowerCase()) ||
     token.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleImport = () => {
    if (customAddress && customAddress.startsWith('0x')) {
      const newToken: Token = {
        address: customAddress,
        symbol: 'CUSTOM',
        name: 'Custom Token',
        decimals: 18,
      };
      onSelect(newToken);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-emerald-500/20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Select Token</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or address"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                {token.symbol.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">{token.symbol}</div>
                <div className="text-gray-400 text-sm">{token.name}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <input
            type="text"
            placeholder="Paste token address"
            value={customAddress}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomAddress(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 mb-2"
          />
          <button
            onClick={handleImport}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Import Token
          </button>
        </div>
      </div>
    </div>
  );
}
