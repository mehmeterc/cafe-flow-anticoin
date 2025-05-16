
import { memo } from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative">
      <div className="bg-hero-gradient text-white py-16 px-4 sm:px-6 rounded-b-3xl">
        <div className="container mx-auto max-w-3xl">
          {/* Badge announcement */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm animate-fade-in">
            <span className="mr-2">🚀</span>
            <span>New: AntiCoins on Solana</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Focus Powered<br />by Blockchain
          </h1>
          
          <p className="text-xl mb-6 text-white/90 max-w-lg">
            Transform your focus into <span className="font-semibold">valuable tokens</span> at premium workspaces worldwide.
          </p>
          
          <p className="text-xl mb-8">
            Earn, spend, and grow with <span className="text-antiapp-coin font-bold">AntiCoins</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link 
              to="/explore" 
              className="gradient-button bg-white/10 backdrop-blur-sm border border-white/20 text-center"
            >
              Explore Workspaces →
            </Link>
            
            <Link 
              to="/how-it-works" 
              className="text-center px-6 py-3 border border-white/30 rounded-full hover:bg-white/10 transition-colors"
            >
              How It Works ↓
            </Link>
          </div>
        </div>
      </div>
      
      {/* Coin display floating card */}
      <div className="absolute -bottom-10 right-8 bg-white rounded-2xl shadow-xl p-4 animate-slide-in-right hidden md:block">
        <div className="flex items-center gap-3">
          <div className="bg-antiapp-coin rounded-full w-10 h-10 flex items-center justify-center font-bold text-black">
            AC
          </div>
          <div>
            <p className="text-2xl font-bold">10,240</p>
            <p className="text-sm text-gray-600">AntiCoins Earned</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(HeroSection);
