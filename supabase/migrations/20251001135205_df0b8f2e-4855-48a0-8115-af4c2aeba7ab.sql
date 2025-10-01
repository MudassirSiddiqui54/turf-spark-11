-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('customer', 'turf_manager');

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create turfs table
CREATE TABLE public.turfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  amenities TEXT[],
  opening_time TIME NOT NULL DEFAULT '06:00:00',
  closing_time TIME NOT NULL DEFAULT '23:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on turfs
ALTER TABLE public.turfs ENABLE ROW LEVEL SECURITY;

-- Turfs policies
CREATE POLICY "Anyone can view turfs"
  ON public.turfs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can create their own turfs"
  ON public.turfs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = manager_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'turf_manager')
  );

CREATE POLICY "Managers can update their own turfs"
  ON public.turfs FOR UPDATE
  TO authenticated
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can delete their own turfs"
  ON public.turfs FOR DELETE
  TO authenticated
  USING (auth.uid() = manager_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id UUID NOT NULL REFERENCES public.turfs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  customer_notes TEXT,
  manager_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Managers can view bookings for their turfs"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = manager_id);

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer')
  );

CREATE POLICY "Managers can update bookings for their turfs"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = manager_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();