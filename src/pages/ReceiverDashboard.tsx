import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DonationCard, { DonationStatus } from "@/components/DonationCard";

interface Donation {
  _id: string;
  category: string;
  quantity: number;
  unit: string;
  expiryAt: string;
  location: any;
  status: DonationStatus;
  donor?: { name: string; email: string };
}

const ReceiverDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch("http://localhost:5000/kindMeal/list", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDonations(data.donations || []);
      } catch (err) {
        console.error("Failed to fetch donations:", err);
        toast.error("Failed to load available donations");
      }
    };

    fetchDonations();
  }, []);

  const handleClaim = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/kindMeal/receive/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          deliveryLocation: { coordinates: [77.1, 28.6] },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);

      toast.success("Donation claimed successfully!");
      setDonations((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status: "MATCHED" as DonationStatus } : d
        )
      );
    } catch (err) {
      console.error("Failed to claim:", err);
      toast.error("Failed to claim donation");
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const filtered = donations.filter((d) =>
    d.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const available = filtered.filter((d) => d.status === "LISTED");
  const claimed = filtered.filter((d) => d.status === "MATCHED");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Kind Meal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Receiver Dashboard</span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Browse Donations</h2>
          <p className="text-muted-foreground">
            Claim food donations to help your community
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by food category..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-xl font-semibold">Available Donations</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {available.map((d) => (
                <DonationCard
                  key={d._id}
                  id={d._id}
                  category={d.category}
                  quantity={d.quantity}
                  unit={d.unit}
                  expiryDate={d.expiryAt}
                  location={d.location}
                  status={d.status}
                  donorName={d.donor?.name || "Anonymous"}
                  showActions
                  onClaim={handleClaim}
                />
              ))}
            </div>
            {available.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No available donations at the moment</p>
              </Card>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">My Claimed Donations</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {claimed.map((d) => (
                <DonationCard
                  key={d._id}
                  id={d._id}
                  category={d.category}
                  quantity={d.quantity}
                  unit={d.unit}
                  expiryDate={d.expiryAt}
                  location={d.location}
                  status={d.status}
                  donorName={d.donor?.name || "Anonymous"}
                />
              ))}
            </div>
            {claimed.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  You haven't claimed any donations yet
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceiverDashboard;
