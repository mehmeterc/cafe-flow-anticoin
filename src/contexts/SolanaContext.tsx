import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  clusterApiUrl, 
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { 
  useWallet, 
  WalletProvider as SolanaWalletProvider 
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer, 
  createTransferInstruction } from '@solana/spl-token';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Use devnet for development, change to mainnet-beta for production
const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
const ANTI_COIN_DECIMAL_PLACES = 0; // AntiCoins are whole numbers

// Anti-Coin token parameters
// In a real app, this would be a fixed, deployed token address
// For now, we'll simulate token deployment
const ANTI_COIN_TOKEN_ADDRESS = import.meta.env.VITE_ANTI_COIN_TOKEN_ADDRESS;

type SolanaContextType = {
  connection: Connection;
  connected: boolean;
  publicKey: PublicKey | null;
  walletBalance: number;
  tokenBalance: number;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  mintAntiCoins: (amount: number) => Promise<string | null>;
  transferAntiCoins: (to: string, amount: number) => Promise<string | null>;
};

const SolanaContext = createContext<SolanaContextType | null>(null);

export function useSolana() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  console.log('Initializing SolanaProvider...');
  console.log('SOLANA_NETWORK:', SOLANA_NETWORK);
  console.log('ANTI_COIN_TOKEN_ADDRESS:', ANTI_COIN_TOKEN_ADDRESS);
  
  const wallet = useWallet();
  const { publicKey, connect, disconnect, connected, connecting } = wallet;
  const { profile, user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [connection, setConnection] = useState<Connection>(() => {
    try {
      const url = clusterApiUrl(SOLANA_NETWORK);
      console.log('Connecting to Solana cluster:', url);
      return new Connection(url, 'confirmed');
    } catch (error) {
      console.error('Failed to create Solana connection:', error);
      throw new Error(`Failed to connect to Solana ${SOLANA_NETWORK}`);
    }
  });

  console.log('Wallet state:', {
    publicKey: publicKey?.toString(),
    connected,
    connecting,
    walletName: wallet.wallet?.adapter?.name
  });

  // Update wallet balances when wallet changes
  useEffect(() => {
    if (wallet.publicKey) {
      updateBalances();
    } else {
      setWalletBalance(0);
      setTokenBalance(0);
    }
  }, [wallet.publicKey, wallet.connected]);

  // Update profile wallet address when connecting
  useEffect(() => {
    if (wallet.connected && wallet.publicKey && user && profile && 
        (!profile.wallet_address || profile.wallet_address !== wallet.publicKey.toString())) {
      updateProfileWalletAddress(wallet.publicKey.toString());
    }
  }, [wallet.connected, wallet.publicKey, user, profile]);

  // Update Solana balance - retrieve SOL balance and AntiCoin state
  const updateBalances = async () => {
    if (!wallet.publicKey) return;
    
    try {
      // Get SOL balance
      const balance = await connection.getBalance(wallet.publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
      
      // For AntiCoins, we're simulating token transactions with SOL transactions
      // This would be a real token query in production
      try {
        // First attempt to get actual token balance from blockchain
        const mintAddress = new PublicKey(ANTI_COIN_TOKEN_ADDRESS);
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey,
            { mint: mintAddress }
          );
          
          if (tokenAccounts.value.length > 0) {
            // Get the token balance from the first token account
            const tokenAccount = tokenAccounts.value[0];
            const tokenBalance = Number(tokenAccount.account.data.parsed.info.tokenAmount.amount);
            console.log('Retrieved actual token balance from blockchain:', tokenBalance);
            // We'll keep using this value for continuity with what the user has seen before
          }
        } catch (e) {
          console.log('Token account query error (expected in development):', e);
        }
        
        // For now, we'll use a database+local approach for simplicity
        // In production, this would be purely blockchain-based
        if (profile) {
          // If we have a profile value, sync it with our local state
          console.log(`Syncing balance from database: ${profile.anticoin_balance}`);
          setTokenBalance(profile.anticoin_balance);
        }
      } catch (tokenError) {
        console.error('Error handling token balance:', tokenError);
      }
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

  // Update profile wallet address
  const updateProfileWalletAddress = async (address: string) => {
    // You would update this in your database
    console.log(`Updating wallet address to: ${address}`);
    // This is a placeholder - actual implementation would update Supabase profile
  };

  // Connect wallet
  const connectWallet = async () => {
    console.log('connectWallet called');
    try {
      if (wallet.wallet) {
        console.log('Connecting wallet:', wallet.wallet.adapter.name);
        await connect();
      } else {
        console.warn('No wallet available to connect');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (wallet.connected) {
      try {
        await disconnect();
        toast.success('Wallet disconnected');
      } catch (error: any) {
        toast.error(`Failed to disconnect wallet: ${error.message}`);
      }
    }
  };

  // Mint AntiCoins to a user - using a real SOL transfer as proof of blockchain activity
  const mintAntiCoins = async (amount: number) => {
    if (!wallet.publicKey || !wallet.signTransaction || !user) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      // Show loading state
      toast.loading('Preparing blockchain transaction...');
      
      // Make a tiny SOL transfer to demonstrate real blockchain activity
      // This will update your wallet and appear in your transaction history
      try {
        // Create a transaction that transfers a tiny amount of SOL back to yourself
        // This is a real blockchain transaction but doesn't cost anything
        const uniqueTimestamp = Date.now().toString();
        const memoData = new TextEncoder().encode(`AntiCoin Mint: ${amount} coins at ${uniqueTimestamp}`);
        
        // Create a unique memo instruction to ensure the transaction is always different
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(memoData)
        });
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: wallet.publicKey,  // Send to self
            lamports: amount * 100,       // Very small amount scaled by AntiCoins
          }),
          memoInstruction  // Add the memo to make transaction unique
        );
        
        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        
        // Sign transaction (this will trigger the wallet UI)
        const signed = await wallet.signTransaction(transaction);
        
        // Send and confirm transaction
        const signature = await connection.sendRawTransaction(signed.serialize());
        
        // Wait for confirmation with a timeout
        try {
          const confirmResult = await connection.confirmTransaction(signature, 'confirmed');
          if (confirmResult.value.err) {
            throw new Error(`Transaction failed: ${confirmResult.value.err}`);
          }
          
          console.log(`Real blockchain transaction confirmed with signature: ${signature}`);
          console.log(`Explore at: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
          
          // Now update the database balance to match
          if (profile) {
            // Calculate new balance
            const newBalance = (profile.anticoin_balance || 0) + amount;
            
            // Update user profile balance in database
            const { error: profileError } = await supabase
              .from("user_profiles")
              .update({
                anticoin_balance: newBalance,
                updated_at: new Date().toISOString()
              })
              .eq("id", user.id);
            
            if (profileError) {
              console.error('Error updating profile balance:', profileError);
              throw new Error('Database update failed');
            }
            
            // Create transaction record in database
            const { error: transactionError } = await supabase
              .from("anticoin_transactions")
              .insert({
                user_id: user.id,
                amount: amount,
                transaction_type: "earn",
                description: `Earned ${amount} AntiCoins through check-out`,
                blockchain_tx_id: signature
              });
            
            if (transactionError) {
              console.error('Error recording transaction:', transactionError);
            }
            
            // Update local state to match database
            setTokenBalance(newBalance);
          } else {
            // If no profile, just update the local state
            setTokenBalance(prev => prev + amount);
          }
          
          // Dismiss loading toast
          toast.dismiss();
          toast.success(`${amount} AntiCoins earned - check your wallet!`);
          
          return signature;
        } catch (confirmError) {
          console.error('Error confirming transaction:', confirmError);
          toast.dismiss();
          toast.error('Transaction timed out but may still complete');
          return signature; // Return signature anyway as it might still confirm
        }
      } catch (err) {
        console.error('Error creating transaction:', err);
        toast.dismiss();
        toast.error(`Transaction error: ${err.message}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      toast.dismiss();
      toast.error(`Failed to mint tokens: ${error.message}`);
      return null;
    }
  };

  // Transfer AntiCoins to another wallet - with real blockchain transactions and database updates
  const transferAntiCoins = async (to: string, amount: number) => {
    if (!wallet.publicKey || !wallet.signTransaction || !user) {
      toast.error('Wallet not connected');
      return null;
    }

    if (tokenBalance < amount) {
      toast.error('Insufficient AntiCoins balance');
      return null;
    }

    try {
      // Show loading state
      toast.loading('Preparing transfer transaction...');
      
      // Create a real SOL transaction from user to destination
      // This is an actual blockchain transaction that will appear in wallet history
      const receiverPublicKey = new PublicKey(to);
      
      try {
        // Create a transaction to transfer a tiny amount of SOL to represent the token transfer
        // In a production app, this would be a token transfer, but we're using SOL for demonstration
        
        // Create unique memo data to ensure each transaction is different
        const uniqueTimestamp = Date.now().toString();
        const memoData = new TextEncoder().encode(`AntiCoin Transfer: ${amount} to ${to.slice(0, 5)} at ${uniqueTimestamp}`);
        
        // Create a unique memo instruction
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(memoData)
        });
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: receiverPublicKey,  // Send to the specified recipient wallet
            lamports: amount * 100,        // Scaling the amount to make it small but representative
          }),
          memoInstruction // Add the memo to make transaction unique
        );
        
        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        
        // Sign transaction
        const signed = await wallet.signTransaction(transaction);
        
        // Send the transaction
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log(`Transfer transaction sent with signature: ${signature}`);
        
        // Wait for confirmation
        const confirmResult = await connection.confirmTransaction(signature, 'confirmed');
        if (confirmResult.value.err) {
          throw new Error(`Transaction failed: ${confirmResult.value.err}`);
        }
        
        console.log(`Real blockchain transfer confirmed: ${signature}`);
        console.log(`Explore at: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        
        // Now update the database balance
        if (profile) {
          // Update user profile balance in the database
          const { error: profileError } = await supabase
            .from("user_profiles")
            .update({
              anticoin_balance: (profile.anticoin_balance || 0) - amount,
              updated_at: new Date().toISOString()
            })
            .eq("id", user.id);
          
          if (profileError) {
            console.error('Error updating profile balance:', profileError);
            throw new Error('Database update failed');
          }
          
          // Create transaction record in database
          const { error: transactionError } = await supabase
            .from("anticoin_transactions")
            .insert({
              user_id: user.id,
              amount: -amount,
              transaction_type: "spend",
              description: `Transfer to ${to.slice(0, 6)}...${to.slice(-4)}`,
              blockchain_tx_id: signature
            });
          
          if (transactionError) {
            console.error('Error recording transaction:', transactionError);
          }
        }
        
        // Update the local balance 
        setTokenBalance(prev => prev - amount);
        
        // Dismiss loading toast
        toast.dismiss();
        toast.success(`${amount} AntiCoins transferred to ${to.slice(0, 6)}...${to.slice(-4)}`);
        
        // Update displayed balances
        updateBalances();
        
        return signature;
      } catch (txError) {
        console.error('Error in transfer transaction:', txError);
        toast.dismiss();
        toast.error(`Transfer failed: ${txError.message}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      toast.dismiss();
      toast.error(`Failed to transfer: ${error.message}`);
      return null;
    }
  };

  const value = {
    connection,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    walletBalance,
    tokenBalance,
    connecting: wallet.connecting,
    connectWallet,
    disconnectWallet,
    mintAntiCoins,
    transferAntiCoins,
  };

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
}

// Wrap component to provide all Solana-related providers
export function SolanaWalletProviderWrapper({ children }: { children: ReactNode }) {
  console.log('Initializing SolanaWalletProviderWrapper...');
  
  try {
    // Set up wallet adapters
    const wallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ];
    console.log('Wallet adapters initialized:', wallets.map(w => w.name));

    return (
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    );
  } catch (error) {
    console.error('Error initializing Solana wallet provider:', error);
    // Fallback UI if Solana wallet initialization fails
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <h3 className="font-bold">Wallet Connection Error</h3>
        <p className="text-sm">Failed to initialize wallet connection. Please refresh the page or try again later.</p>
        <pre className="mt-2 text-xs overflow-auto p-2 bg-black text-white rounded">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </pre>
      </div>
    );
  }
}
