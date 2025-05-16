
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import HeroSection from "@/components/home/HeroSection";
import FeatureCards from "@/components/home/FeatureCards";
import EventsCarousel from "@/components/home/EventsCarousel";
import CafeSpotlight from "@/components/home/CafeSpotlight";
import CtaSection from "@/components/home/CtaSection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureCards />
        <EventsCarousel />
        <CafeSpotlight />
        <CtaSection />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
