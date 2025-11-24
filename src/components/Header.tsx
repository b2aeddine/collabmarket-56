import { useState, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle, Bell, User, LogOut, Heart } from "lucide-react";
import { useUnreadMessagesCount } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const unreadCount = useUnreadMessagesCount();
  const {
    profile,
    signOut
  } = useAuth();
  
  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (_error) {
      // Error is logged by auth context
    }
  }, [signOut]);
  
  const _toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Déterminer la bonne route du dashboard selon le rôle
  const dashboardRoute = useMemo(() => {
    if (profile?.role === 'commercant') {
      return '/merchant-dashboard';
    } else if (profile?.role === 'influenceur') {
      return '/influencer-dashboard';
    } else if (profile?.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/';
  }, [profile?.role]);
  return <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Heart className="text-white w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Collabmarket
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/catalog">
              <Button variant={isActive('/catalog') ? 'default' : 'ghost'} className={isActive('/catalog') ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}>
                Catalogue
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant={isActive('/how-it-works') ? 'default' : 'ghost'} className={isActive('/how-it-works') ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}>Comment ça marche ?
            </Button>
            </Link>
            <Link to="/faq">
              <Button variant={isActive('/faq') ? 'default' : 'ghost'} className={isActive('/faq') ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}>
                FAQ
              </Button>
            </Link>
          </nav>

          {/* Desktop Right Section - Messages, Profile, Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {/* Messages Button */}
            {profile && <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  {unreadCount > 0 && <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center p-0">
                      {unreadCount}
                    </Badge>}
                </Button>
              </Link>}

            {/* Notifications Button */}
            {profile && <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>}

            {/* Profile or Auth Buttons */}
            {profile ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1.5 lg:space-x-2 px-2 lg:px-3">
                    <Avatar className="w-7 h-7 lg:w-8 lg:h-8">
                      <AvatarImage src={profile.avatar_url || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs lg:text-sm">
                        {profile.first_name && profile.last_name ? `${profile.first_name[0]}${profile.last_name[0]}` : <User className="w-3 h-3 lg:w-4 lg:h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:block text-sm font-medium">
                      {profile.first_name ? `${profile.first_name}` : 'Profil'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={dashboardRoute} className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <>
                <Link to="/login">
                  <Button variant="outline" className="text-sm lg:text-base px-3 lg:px-4">Connexion</Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 text-sm lg:text-base px-3 lg:px-4">
                    Inscription
                  </Button>
                </Link>
              </>}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden border-t border-gray-200 py-3 sm:py-4 space-y-1.5 sm:space-y-2">
            <Link to="/catalog" onClick={() => setIsMenuOpen(false)}>
              <Button variant={isActive('/catalog') ? 'default' : 'ghost'} className={`w-full justify-start text-sm sm:text-base ${isActive('/catalog') ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}>
                Catalogue
              </Button>
            </Link>
            <Link to="/how-it-works" onClick={() => setIsMenuOpen(false)}>
              <Button variant={isActive('/how-it-works') ? 'default' : 'ghost'} className={`w-full justify-start text-sm sm:text-base ${isActive('/how-it-works') ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}>
                Comment ça marche
              </Button>
            </Link>
            <Link to="/faq" onClick={() => setIsMenuOpen(false)}>
              <Button variant={isActive('/faq') ? 'default' : 'ghost'} className={`w-full justify-start text-sm sm:text-base ${isActive('/faq') ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' : ''}`}>
                FAQ
              </Button>
            </Link>
            
            <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
              {/* Messages Button Mobile */}
              {profile && <Link to="/messages" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start relative text-sm sm:text-base">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                    {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>}
                  </Button>
                </Link>}

              {/* Profile or Auth Buttons Mobile */}
              {profile ? <>
                  <Link to={dashboardRoute} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm sm:text-base">
                      <Avatar className="w-5 h-5 sm:w-6 sm:h-6 mr-2">
                        <AvatarImage src={profile.avatar_url || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs">
                          {profile.first_name && profile.last_name ? `${profile.first_name[0]}${profile.last_name[0]}` : <User className="w-3 h-3" />}
                        </AvatarFallback>
                      </Avatar>
                      Mon Profil
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-red-600 text-sm sm:text-base" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </> : <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full text-sm sm:text-base">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:opacity-90 text-sm sm:text-base">
                      Inscription
                    </Button>
                  </Link>
                </>}
            </div>
          </div>}
      </div>
    </header>;
});

Header.displayName = 'Header';

export default Header;