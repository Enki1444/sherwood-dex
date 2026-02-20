import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Header } from './components/Header';
import { SwapCard } from './components/SwapCard';
import { LiquidityCard } from './components/LiquidityCard';
import { AnalyticsCard } from './components/AnalyticsCard';
import { config } from './config/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#10b981',
          borderRadius: 'medium',
        })}>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={
                    <div className="max-w-md mx-auto">
                      <SwapCard />
                    </div>
                  } />
                  <Route path="/liquidity" element={
                    <div className="max-w-md mx-auto">
                      <LiquidityCard />
                    </div>
                  } />
                  <Route path="/analytics" element={
                    <div className="max-w-4xl mx-auto">
                      <AnalyticsCard />
                    </div>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <footer className="text-center py-8 text-gray-500 text-sm">
                🏹 Sherwood DEX - Take from the whales, give to the forest
              </footer>
            </div>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
