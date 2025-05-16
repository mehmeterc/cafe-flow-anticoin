
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sponsor } from "@/types/supabase";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

const Partners = () => {
  // Fetch sponsors
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sponsors")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold mb-2">Our Partners & Sponsors</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the amazing companies and organizations that help make AntiApp possible
              and support our mission to transform quiet café hours into productive coworking spaces.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
            </div>
          ) : sponsors && sponsors.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.map((sponsor) => (
                  <Card key={sponsor.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="h-24 flex items-center justify-center mb-4">
                        <img
                          src={sponsor.logo_url || "https://via.placeholder.com/200x100"}
                          alt={sponsor.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-lg text-center mb-2">{sponsor.name}</h3>
                      <p className="text-gray-600 text-center mb-4">{sponsor.description}</p>
                      {sponsor.website_url && (
                        <a
                          href={sponsor.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-antiapp-purple hover:underline flex items-center justify-center"
                        >
                          Visit Website
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-12 bg-gray-50 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Interested in becoming a partner?</h2>
                <p className="text-gray-600 mb-4">
                  If your organization is interested in partnering with AntiApp, we'd love to hear from you!
                </p>
                <a 
                  href="mailto:partners@antiapp.com" 
                  className="inline-flex items-center text-antiapp-purple hover:underline"
                >
                  Contact our partnerships team
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No sponsors found</h3>
              <p className="mt-1 text-gray-500">
                Check back soon to see our amazing partners
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Partners;
