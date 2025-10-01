import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import TurfCard from "@/components/TurfCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Turfs = () => {
  const [user, setUser] = useState<any>(null);
  const [turfs, setTurfs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("turfs")
      .select(`
        *,
        profiles:manager_id (
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: false });

    setTurfs(data || []);
    setLoading(false);
  };

  const filteredTurfs = turfs.filter(
    (turf) =>
      turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turf.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Browse Turfs</h1>
            <p className="text-muted-foreground mb-6">
              Find and book the perfect turf for your game
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by name, city, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading turfs...</p>
            </div>
          ) : filteredTurfs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No turfs found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTurfs.map((turf) => (
                <TurfCard key={turf.id} turf={turf} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Turfs;
