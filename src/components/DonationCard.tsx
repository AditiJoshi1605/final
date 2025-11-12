import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Package } from "lucide-react";

export type DonationStatus = "LISTED" | "MATCHED" | "PICKED" | "DELIVERED";

interface DonationCardProps {
  id: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  location: string | { type: string; coordinates: number[] }; //  supports both string & object
  status: DonationStatus;
  donorName?: string;
  showActions?: boolean;
  onClaim?: (id: string) => void;
  onPickup?: (id: string) => void;
}

const getStatusColor = (status: DonationStatus) => {
  switch (status) {
    case "LISTED":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "MATCHED":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "PICKED":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "DELIVERED":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "";
  }
};

const DonationCard = ({
  id,
  category,
  quantity,
  unit,
  expiryDate,
  location,
  status,
  donorName,
  showActions = true,
  onClaim,
  onPickup,
}: DonationCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-medium transition-all">
      <CardHeader className="bg-gradient-subtle">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{category}</CardTitle>
            {donorName && (
              <CardDescription className="mt-1">From: {donorName}</CardDescription>
            )}
          </div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>
            {quantity} {unit}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Expires: {new Date(expiryDate).toLocaleDateString()}</span>
        </div>

        {/* Friendly location display */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="line-clamp-2">
            {typeof location === "string"
              ? location
              : "Pickup location saved"}
          </span>
        </div>

        {showActions && status === "LISTED" && onClaim && (
          <Button onClick={() => onClaim(id)} className="w-full mt-4">
            Claim Donation
          </Button>
        )}

        {showActions && status === "MATCHED" && onPickup && (
          <Button onClick={() => onPickup(id)} className="w-full mt-4" variant="outline">
            Mark as Picked Up
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DonationCard;
