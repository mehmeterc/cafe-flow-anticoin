
import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins } from "lucide-react";

const Navbar = () => {
  const { user, profile } = useAuth();

  return (
    <nav className="py-4 px-4 sm:px-6 flex items-center justify-between border-b">
      <Link to="/" className="text-xl font-bold text-antiapp-purple">
        AntiApp
      </Link>
      
      {user ? (
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center">
            <Coins className="h-4 w-4 mr-1 text-antiapp-purple" />
            <span className="font-semibold">{profile?.anticoin_balance || 0}</span>
          </div>
          
          <Link to="/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
              <AvatarFallback>
                {profile?.name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      ) : (
        <div>
          <Button asChild variant="outline" className="mr-2">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild className="bg-hero-gradient hover:opacity-90">
            <Link to="/auth?tab=signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </nav>
  );
};

export default memo(Navbar);
