
import { Suspense, lazy, Component, ErrorInfo, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SolanaWalletProviderWrapper } from "@/contexts/SolanaContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">We're working on fixing this issue. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-antiapp-purple text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
  </div>
);

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Explore = lazy(() => import("./pages/Explore"));
const CafeDetail = lazy(() => import("./pages/CafeDetail"));
const Live = lazy(() => import("./pages/Live"));
const Bookings = lazy(() => import("./pages/Bookings"));
const NewBooking = lazy(() => import("./pages/NewBooking"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Events = lazy(() => import("./pages/Events"));
const Profile = lazy(() => import("./pages/Profile"));
const Partners = lazy(() => import("./pages/Partners"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    },
  },
});

// Initialize error logging
const logError = (error: Error, errorInfo: ErrorInfo) => {
  console.error('Application Error:', {
    error: error.toString(),
    info: errorInfo,
    timestamp: new Date().toISOString(),
  });};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SolanaWalletProviderWrapper>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Suspense fallback={<PageLoading />}><Index /></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<PageLoading />}><Auth /></Suspense>} />
            <Route path="/explore" element={<Suspense fallback={<PageLoading />}><Explore /></Suspense>} />
            <Route path="/cafes/:id" element={<Suspense fallback={<PageLoading />}><CafeDetail /></Suspense>} />

            <Route path="/live" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}><Live /></Suspense>
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}><Bookings /></Suspense>
              </ProtectedRoute>
            } />

            <Route path="/bookings/new" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}><NewBooking /></Suspense>
              </ProtectedRoute>
            } />

            <Route path="/rewards" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}><Rewards /></Suspense>
              </ProtectedRoute>
            } />

            <Route path="/events" element={<Suspense fallback={<PageLoading />}><Events /></Suspense>} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoading />}><Profile /></Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/partners" element={<Suspense fallback={<PageLoading />}><Partners /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoading />}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
          </TooltipProvider>
        </SolanaWalletProviderWrapper>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
