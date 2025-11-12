import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, MapPin, CheckCircle2, Navigation, Heart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<any[]>([]);

  //  Fetch assigned deliveries for driver
  useEffect(() => {
    fetch("http://localhost:5000/kindMeal/driver/assigned", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.deliveries) setDeliveries(data.deliveries);
      })
      .catch(() => toast.error("Failed to load assigned deliveries"));
  }, []);

  //  Mark as Picked
  const handlePickup = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/kindMeal/${id}/driver`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Marked as Picked up!");
        setDeliveries((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: "PICKED" } : d))
        );
      } else {
        toast.error("Failed to mark pickup");
      }
    } catch {
      toast.error("Server error while marking pickup");
    }
  };

  // Mark as Delivered
  const handleDelivery = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/kindMeal/${id}/deliver`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Delivery completed!");
        setDeliveries((prev) =>
          prev.map((d) => (d._id === id ? { ...d, status: "DELIVERED" } : d))
        );
      } else {
        toast.error("Failed to mark delivery");
      }
    } catch {
      toast.error("Server error while marking delivery");
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

 return (
  <div className="min-h-screen bg-background">
    <header className="border-b bg-card shadow-soft">
      <div className="container mx-auto flex justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Kind Meal</h1>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </header>

    <main className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Assigned Deliveries</h2>

      {deliveries.length === 0 ? (
        <p className="text-muted-foreground">No deliveries assigned yet.</p>
      ) : (
        <div className="grid gap-6">
          {deliveries.map((d) => (
            <Card key={d._id}>
              <CardHeader>
                <CardTitle>{d.donor?.name || "Donor"}</CardTitle>
                <CardDescription>{d.category}</CardDescription>
                <Badge>{d.status}</Badge>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Pickup:</strong>{" "}
                  {d.pickupAddress || d.donor?.organization || "Donor location"}
                </p>
                <p>
                  <strong>Delivery:</strong>{" "}
                  {d.deliveryAddress || "Receiver location"}
                </p>

                {/*Progress bar */}
                <div className="w-full bg-gray-200 h-3 rounded-full mt-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      d.status === "MATCHED"
                        ? "bg-yellow-400 w-1/3"
                        : d.status === "PICKED"
                        ? "bg-blue-500 w-2/3"
                        : d.status === "DELIVERED"
                        ? "bg-green-500 w-full"
                        : "w-0"
                    }`}
                  ></div>
                </div>

                <div className="mt-4 flex gap-3">
                  {d.status === "MATCHED" && (
                    <Button onClick={() => handlePickup(d._id)}>
                      <Navigation className="mr-2 h-4 w-4" />
                      Mark as Picked
                    </Button>
                  )}
                  {d.status === "PICKED" && (
                    <Button onClick={() => handleDelivery(d._id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  </div>
);

};

export default DriverDashboard;
