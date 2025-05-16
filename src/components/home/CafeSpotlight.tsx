
const CafeSpotlight = () => {
  return (
    <div className="py-12 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="bg-hero-gradient rounded-3xl overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Where Focus Becomes Currency</h2>
              <p className="text-lg mb-8">
                Discover the most productive spaces to fuel your focus and earn rewards for your time.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold mb-3">Cafe Re:form</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Focus Rewards</p>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Pay: 4.00 USDC/hr</span>
                      <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">→</span>
                      <span className="font-semibold text-antiapp-coin">Earn: 2 AntiCoins/hr</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Berlin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    <span>WiFi</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Power</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>Drinks</span>
                  </div>
                </div>
                
                <button className="mt-6 w-full py-3 bg-white text-antiapp-purple rounded-lg font-semibold hover:bg-white/90 transition-colors">
                  Open Now
                </button>
              </div>
            </div>
            
            <div className="md:w-1/2 bg-white p-4 hidden md:block">
              <div className="h-full rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d" 
                  alt="Cafe interior" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeSpotlight;
