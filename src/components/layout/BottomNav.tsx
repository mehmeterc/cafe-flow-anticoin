import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, Clock, Gift, User } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/") ? "text-antiapp-purple" : "text-gray-500"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/explore"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/explore") ? "text-antiapp-purple" : "text-gray-500"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Discover</span>
        </Link>

        <Link
          to="/live"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/live") ? "text-antiapp-purple" : "text-gray-500"
          }`}
        >
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">Live</span>
        </Link>

        <Link
          to="/events"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/events") ? "text-antiapp-purple" : "text-gray-500"
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Events</span>
        </Link>

        <Link
          to="/rewards"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/rewards") ? "text-antiapp-purple" : "text-gray-500"
          }`}
        >
          <Gift className="h-5 w-5" />
          <span className="text-xs mt-1">Rewards</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/profile") ? "text-antiapp-purple" : "text-gray-500"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default memo(BottomNav);
