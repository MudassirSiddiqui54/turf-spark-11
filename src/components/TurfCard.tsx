import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign } from "lucide-react";

interface TurfCardProps {
  turf: any;
}

const TurfCard = ({ turf }: TurfCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-glow transition-all duration-300">
      <CardHeader className="p-0">
        <div className="h-48 bg-gradient-primary relative overflow-hidden">
          {turf.image_url ? (
            <img 
              src={turf.image_url} 
              alt={turf.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-foreground text-4xl font-bold">
              {turf.name.charAt(0)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-semibold mb-2">{turf.name}</h3>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{turf.location}, {turf.city}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{turf.opening_time} - {turf.closing_time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">${turf.price_per_hour}/hour</span>
          </div>
        </div>

        {turf.amenities && turf.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {turf.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        )}

        {turf.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {turf.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link to={`/turf/${turf.id}`} className="w-full">
          <Button className="w-full bg-gradient-primary hover:opacity-90">
            View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TurfCard;
