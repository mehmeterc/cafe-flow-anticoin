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
      
      // For AntiCoins, we're getting the balance from the database
      if (user && profile) {
        setTokenBalance(profile.anticoin_balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // Update profile wallet address
  const updateProfileWalletAddress = async (address: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_profiles').update({ wallet_address: address }).eq('id', user.id);
    if (error) console.error('Error updating wallet address:', error);
  };

  // Connect wallet
  const connectWallet = async () => {
    if (connecting || connected) return;
    
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (!connected) return;
    
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
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
      } catch (err: any) {
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
    
    try {
      // Check if the destination is a valid public key
      let toPublicKey: PublicKey;
      try {
        toPublicKey = new PublicKey(to);
      } catch (error) {
        toast.error('Invalid destination address');
        return null;
      }
      
      // Check balance before transfer
      if (amount > tokenBalance) {
        toast.error(`Not enough AntiCoins. You have ${tokenBalance} but need ${amount}`);
        return null;
      }
      
      // Show loading state
      toast.loading('Preparing transfer transaction...');
      
      try {
        // Generate a truly unique identifier for this transaction
        const uniqueId = `transfer-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        console.log('Creating transaction with unique ID:', uniqueId);
        
        // Use a unique memo to prevent transaction duplication
        const memoData = new TextEncoder().encode(`AntiCoin Transfer: ${amount} coins to ${to.slice(0,6)} (${uniqueId})`);
        
        // Create a unique memo instruction
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(memoData)
        });
        
        // Create a transaction that transfers a tiny amount of SOL to recipient
        // Use a very small amount - just enough to create a real transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: toPublicKey,
            lamports: Math.max(1, amount * 10),  // Ensure at least 1 lamport is sent
          }),
          memoInstruction  // Add the memo to make transaction unique
        );
        
        // Get recent blockhash
        console.log('Getting recent blockhash...');
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;
        
        // Sign transaction
        console.log('Requesting transaction signature...');
        const signed = await wallet.signTransaction(transaction);
        
        // Send the transaction
        console.log('Sending transaction to network...');
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log(`Transfer transaction sent with signature: ${signature}`);
        
        // Wait for confirmation
        console.log('Waiting for confirmation...');
        const confirmResult = await connection.confirmTransaction(signature, 'confirmed');
        if (confirmResult.value.err) {
          throw new Error(`Transaction failed: ${confirmResult.value.err}`);
        }
        
        console.log(`Real blockchain transfer confirmed: ${signature}`);
        console.log(`Explore at: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        
        // Now update the database balance
        if (profile) {
          console.log('Updating database balance...');
          // Calculate new balance with safety check
          const currentBalance = profile.anticoin_balance || 0;
          const newBalance = Math.max(0, currentBalance - amount);
          
          // Update user profile balance in the database
          const { error: profileError } = await supabase
            .from("user_profiles")
            .update({
              anticoin_balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq("id", user.id);
          
          if (profileError) {
            console.error('Error updating profile balance:', profileError);
            throw new Error(`Database update failed: ${profileError.message}`);
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
          
          // Update the local balance to match database
          setTokenBalance(newBalance);
        } else {
          // If no profile, just update the local state
          setTokenBalance(prev => Math.max(0, prev - amount));
        }
        
        // Dismiss loading toast
        toast.dismiss();
        toast.success(`${amount} AntiCoins transferred to ${to.slice(0, 6)}...${to.slice(-4)}`);
        
        return signature;
      } catch (txError: any) {
        console.error('Error in transfer transaction:', txError);
        toast.dismiss();
        toast.error(`Transfer failed: ${txError?.message || 'Unknown error'}`);
        return null;
      }
    } catch (error: any) {
      console.error('Error transferring tokens:', error);
      toast.dismiss();
      toast.error(`Failed to transfer: ${error?.message || 'Unknown error'}`);
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
