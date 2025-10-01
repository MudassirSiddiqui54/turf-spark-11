import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface CustomerDashboardProps {
  profile: any;
}

const CustomerDashboard = ({ profile }: CustomerDashboardProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [profile]);

  const fetchBookings = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        turfs (
          name,
          location,
          city,
          price_per_hour
        )
      `)
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false });

    setBookings(data || []);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile.full_name}!</h1>
          <p className="text-muted-foreground">Manage your turf bookings</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{bookings.length}</p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-500">
                {bookings.filter((b) => b.status === "pending").length}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">
                {bookings.filter((b) => b.status === "approved").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Browse Turfs Button */}
        <div className="mb-8">
          <Link to="/turfs">
            <Button className="bg-gradient-primary hover:opacity-90">
              Browse Available Turfs
            </Button>
          </Link>
        </div>

        {/* Bookings List */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't made any bookings yet</p>
                <Link to="/turfs">
                  <Button variant="outline">Browse Turfs</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{booking.turfs?.name}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{booking.turfs?.location}, {booking.turfs?.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{booking.start_time} - {booking.end_time}</span>
                          </div>
                        </div>

                        {booking.customer_notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Note:</span> {booking.customer_notes}
                          </p>
                        )}

                        {booking.manager_notes && booking.status === "rejected" && (
                          <p className="text-sm text-destructive mt-2">
                            <span className="font-medium">Manager's Note:</span> {booking.manager_notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${booking.total_price}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
