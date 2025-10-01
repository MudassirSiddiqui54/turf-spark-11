import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Calendar, User, Building2 } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "turf_manager">("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast({
        title: "Registration successful!",
        description: "You can now sign in to your account.",
      });

      navigate("/auth/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-primary items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join TurfBook and start booking turfs today</p>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Register</CardTitle>
              <CardDescription>Choose your account type and fill in your details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <RadioGroup value={role} onValueChange={(value: any) => setRole(value)}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label htmlFor="customer" className="flex items-center gap-2 cursor-pointer flex-1">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Customer</div>
                          <div className="text-sm text-muted-foreground">Book turfs for playing</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                      <RadioGroupItem value="turf_manager" id="turf_manager" />
                      <Label htmlFor="turf_manager" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5 text-accent" />
                        <div>
                          <div className="font-medium">Turf Manager</div>
                          <div className="text-sm text-muted-foreground">Manage and rent out turfs</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90" 
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
