'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  chainId: string | null;
  isConnecting: boolean;
  provider: any;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const eth = (window as any).ethereum;
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const network = await eth.request({ method: 'eth_chainId' });
          setChainId(parseInt(network, 16).toString());
          setProvider(new ethers.BrowserProvider(eth));
        }
      } catch (err) {
        console.error("Connection check failed:", err);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      eth.on('accountsChanged', (accs: string[]) => setAccount(accs[0] || null));
      eth.on('chainChanged', (hexId: string) => setChainId(parseInt(hexId, 16).toString()));
    }
  }, [checkConnection]);

  const connect = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    setIsConnecting(true);
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const network = await eth.request({ method: 'eth_chainId' });
      setChainId(parseInt(network, 16).toString());
      setProvider(new ethers.BrowserProvider(eth));
    } catch (err) {
      console.error("Manual connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider value={{ account, chainId, isConnecting, provider, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
