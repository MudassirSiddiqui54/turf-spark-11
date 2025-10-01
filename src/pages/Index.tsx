import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Shield, Clock } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import heroTurf from "@/assets/hero-turf.jpg";
import heroIndoor from "@/assets/hero-indoor.jpg";
import featurePlay from "@/assets/feature-play.jpg";

const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      {/* Hero Section with Image Masking */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Images with Masking */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${heroTurf})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
            }}
          />
          <div 
            className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20"
            style={{
              backgroundImage: `url(${heroIndoor})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'circle(50% at 80% 80%)',
            }}
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in text-primary-foreground">
              Book Your Perfect Turf
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 animate-fade-in-up">
              Find and reserve premium sports turfs near you. Easy booking, instant confirmation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link to="/turfs">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow">
                  Browse Turfs
                </Button>
              </Link>
              {!user && (
                <Link to="/auth/register">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in">
            Why Choose TurfBook?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 animate-fade-in-up">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Nearby Turfs</h3>
              <p className="text-muted-foreground">
                Discover premium turfs in your area with our smart location-based search.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Book your slot in seconds with our intuitive scheduling system.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Verified turf managers and secure booking confirmations every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-elegant">
                <img 
                  src={featurePlay} 
                  alt="Players on turf" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full opacity-50"
                style={{
                  backgroundImage: `url(${heroTurf})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: 'circle(50%)',
                  filter: 'blur(2px)',
                }}
              />
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How It Works
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Search for Turfs</h3>
                    <p className="text-muted-foreground">Browse available turfs in your area</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Choose Your Slot</h3>
                    <p className="text-muted-foreground">Select date and time that works for you</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Instant Confirmation</h3>
                    <p className="text-muted-foreground">Get approved by the turf manager and start playing</p>
                  </div>
                </div>
              </div>

              <Link to="/turfs" className="inline-block mt-8">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 shadow-glow">
                  Start Booking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroTurf})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of players and turf managers using TurfBook
          </p>
          {!user && (
            <Link to="/auth/register">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Create Your Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 TurfBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
