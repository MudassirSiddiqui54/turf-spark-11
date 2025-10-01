import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  user?: any;
}

const Header = ({ user }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/");
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              TurfBook
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/turfs" className="text-sm font-medium hover:text-primary transition-colors">
              Browse Turfs
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-slide-up">
            <Link
              to="/"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/turfs"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Turfs
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-gradient-primary hover:opacity-90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
