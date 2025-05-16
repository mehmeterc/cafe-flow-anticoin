import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cafe } from "@/types/supabase";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OptimizedImage from "@/components/ui/optimized-image";
import { toast } from "sonner";
import { Star, MapPin, Wifi, Battery, Volume2 } from "lucide-react";

const Explore = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const availableTags = [
    "quiet", "fast-wifi", "power", "busy", "social", 
    "creative", "tech", "outlets", "desks", "premium",
    "modern", "meeting-rooms", "art"
  ];

  const { data: cafes, isLoading } = useQuery({
    queryKey: ["cafes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cafes")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      return data as Cafe[];
    },
  });

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("cafe_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      if (data) {
        setFavorites(data.map(fav => fav.cafe_id));
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (cafeId: string) => {
    if (!user) {
      toast.error("You must be logged in to favorite cafes");
      return;
    }

    try {
      if (favorites.includes(cafeId)) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("cafe_id", cafeId);
        
        if (error) throw error;
        
        setFavorites(favorites.filter(id => id !== cafeId));
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, cafe_id: cafeId });
        
        if (error) throw error;
        
        setFavorites([...favorites, cafeId]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredCafes = cafes?.filter(cafe => {
    // Filter by search term
    if (searchTerm && !cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !cafe.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      return selectedTags.every(tag => cafe.tags?.includes(tag));
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Discover Workspaces</h1>
            <p className="text-gray-600">
              Find the perfect spot to focus and earn AntiCoins
            </p>
          </div>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search cafes by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-sm text-gray-500">Filter by:</span>
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-antiapp-purple" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
            </div>
          ) : filteredCafes && filteredCafes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCafes.map((cafe) => (
                <div key={cafe.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="relative h-48">
                    <OptimizedImage
                      src={cafe.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                      alt={cafe.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(cafe.id)}
                      className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
                    >
                      <Star 
                        className={`h-5 w-5 ${favorites.includes(cafe.id) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} 
                      />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-800 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {cafe.location}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg mb-1">{cafe.name}</h3>
                      <span className="text-antiapp-purple font-semibold">${cafe.hourly_cost}/hr</span>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-3">{cafe.address}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cafe.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-100">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center" title="WiFi Strength">
                        <Wifi className="h-4 w-4 mr-1" />
                        <span>{cafe.wifi_strength}/5</span>
                      </div>
                      {cafe.power_outlets && (
                        <div className="flex items-center" title="Power Outlets">
                          <Battery className="h-4 w-4 mr-1" />
                          <span>Available</span>
                        </div>
                      )}
                      <div className="flex items-center" title="Noise Level">
                        <Volume2 className="h-4 w-4 mr-1" />
                        <span>{cafe.noise_level}/5</span>
                      </div>
                    </div>
                    
                    <Link to={`/cafes/${cafe.id}`}>
                      <Button className="w-full bg-hero-gradient">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No cafes found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your filters or search term
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Explore;
