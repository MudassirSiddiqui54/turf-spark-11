import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ManagerDashboardProps {
  profile: any;
}

const ManagerDashboard = ({ profile }: ManagerDashboardProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [turfs, setTurfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [managerNotes, setManagerNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    // Fetch turfs
    const { data: turfsData } = await supabase
      .from("turfs")
      .select("*")
      .eq("manager_id", profile.id);

    setTurfs(turfsData || []);

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        *,
        turfs (
          name
        ),
        profiles:customer_id (
          full_name,
          email,
          phone
        )
      `)
      .eq("manager_id", profile.id)
      .order("created_at", { ascending: false });

    setBookings(bookingsData || []);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("bookings")
      .update({ 
        status,
        manager_notes: managerNotes || null
      })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
      fetchData();
      setSelectedBooking(null);
      setManagerNotes("");
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {profile.full_name}!</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-elegant hover:shadow-glow transition-all">
            <CardHeader>
              <CardTitle className="text-lg">Total Turfs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{turfs.length}</p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-lg">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-500">
                $
                {bookings
                  .filter((b) => b.status === "approved")
                  .reduce((sum, b) => sum + parseFloat(b.total_price), 0)
                  .toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Turf</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.turfs?.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{booking.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {booking.start_time} - {booking.end_time}
                        </TableCell>
                        <TableCell className="font-semibold">${booking.total_price}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          {booking.status === "pending" ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setManagerNotes("");
                                  }}
                                >
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Booking</DialogTitle>
                                  <DialogDescription>
                                    Approve or reject this booking request
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm font-medium mb-1">Customer Notes:</p>
                                    <p className="text-sm text-muted-foreground">
                                      {booking.customer_notes || "No notes provided"}
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="manager-notes">Manager Notes (Optional)</Label>
                                    <Textarea
                                      id="manager-notes"
                                      placeholder="Add notes for the customer..."
                                      value={managerNotes}
                                      onChange={(e) => setManagerNotes(e.target.value)}
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                      onClick={() => updateBookingStatus(booking.id, "approved")}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      className="flex-1"
                                      variant="destructive"
                                      onClick={() => updateBookingStatus(booking.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <span className="text-sm text-muted-foreground">No action</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
