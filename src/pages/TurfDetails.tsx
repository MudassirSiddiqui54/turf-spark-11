import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TurfDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [turf, setTurf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    if (id) {
      fetchTurf();
    }
  }, [id]);

  const fetchTurf = async () => {
    const { data } = await supabase
      .from("turfs")
      .select(`
        *,
        profiles:manager_id (
          full_name,
          phone,
          email
        )
      `)
      .eq("id", id)
      .single();

    setTurf(data);
    setLoading(false);
  };

  const calculateTotalPrice = (): string => {
    if (!startTime || !endTime || !turf) return "0";

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return (hours * parseFloat(turf.price_per_hour)).toFixed(2);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a booking",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    setSubmitting(true);

    try {
      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "customer") {
        toast({
          title: "Access denied",
          description: "Only customers can make bookings",
          variant: "destructive",
        });
        return;
      }

      const totalPrice = calculateTotalPrice();

      const { error } = await supabase.from("bookings").insert([{
        turf_id: id as string,
        customer_id: user.id,
        manager_id: turf.manager_id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        total_price: parseFloat(totalPrice),
        customer_notes: customerNotes || null,
        status: "pending" as const,
      }]);

      if (error) throw error;

      toast({
        title: "Booking request sent!",
        description: "The turf manager will review your request shortly.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading turf details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!turf) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p className="text-muted-foreground">Turf not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Turf Details */}
            <div>
              <Card className="shadow-elegant mb-6">
                <CardHeader className="p-0">
                  <div className="h-64 bg-gradient-primary relative overflow-hidden rounded-t-lg">
                    {turf.image_url ? (
                      <img
                        src={turf.image_url}
                        alt={turf.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-foreground text-6xl font-bold">
                        {turf.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h1 className="text-3xl font-bold mb-4">{turf.name}</h1>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">
                        {turf.address}, {turf.location}, {turf.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">
                        {turf.opening_time} - {turf.closing_time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        ${turf.price_per_hour}
                      </span>
                      <span className="text-muted-foreground">/hour</span>
                    </div>
                  </div>

                  {turf.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{turf.description}</p>
                    </div>
                  )}

                  {turf.amenities && turf.amenities.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Amenities</h3>
                      <div className="flex flex-wrap gap-2">
                        {turf.amenities.map((amenity: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-2">Contact Manager</h3>
                    <p className="text-sm text-muted-foreground">
                      {turf.profiles?.full_name}
                    </p>
                    {turf.profiles?.phone && (
                      <p className="text-sm text-muted-foreground">
                        {turf.profiles.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div>
              <Card className="shadow-elegant sticky top-24">
                <CardHeader>
                  <CardTitle>Book This Turf</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requests or notes..."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                      />
                    </div>

                    {startTime && endTime && (
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Amount:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${calculateTotalPrice()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={submitting}
                    >
                      {submitting ? "Sending Request..." : "Request Booking"}
                    </Button>

                    {!user && (
                      <p className="text-sm text-center text-muted-foreground">
                        Please{" "}
                        <a href="/auth/login" className="text-primary hover:underline">
                          sign in
                        </a>{" "}
                        to book this turf
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfDetails;
