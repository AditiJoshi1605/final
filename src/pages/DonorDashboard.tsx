import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Heart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DonationCard from "@/components/DonationCard";

interface Donation {
  _id: string;
  category: string;
  quantity: number;
  unit: string;
  expiryAt: string;
  location: {
    type: string;
    coordinates: number[];
  };
  status: string;
}

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDonation, setNewDonation] = useState({
    category: "",
    quantity: "",
    unit: "kg",
    expiryDate: "",
    location: "",
  });

  // Fetch donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await fetch("http://localhost:5000/kindMeal/list", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to fetch donations");
          setDonations([]);
          return;
        }

        setDonations(data.donations || []); // ✅ Prevent undefined
      } catch (err) {
        console.error("Failed to fetch donations:", err);
        toast.error("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Create new donation
  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/kindMeal/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: newDonation.category,
          quantity: Number(newDonation.quantity),
          unit: newDonation.unit,
          expiryAt: newDonation.expiryDate,
          location: {
            coordinates: [77.1, 28.6],
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create donation");
        return;
      }

      setDonations((prev) => [data.donation, ...prev]);
      toast.success("Donation listed successfully!");
      setIsDialogOpen(false);
      setNewDonation({
        category: "",
        quantity: "",
        unit: "kg",
        expiryDate: "",
        location: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Server error while creating donation");
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Kind Meal</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Donor Dashboard
            </span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">My Donations</h2>
            <p className="text-muted-foreground">
              Manage and track your food donations
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-medium">
                <Plus className="mr-2 h-4 w-4" />
                List New Donation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Donation</DialogTitle>
                <DialogDescription>
                  List your surplus food to help those in need
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDonation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Food Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Fresh Vegetables"
                    value={newDonation.category}
                    onChange={(e) =>
                      setNewDonation({ ...newDonation, category: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="25"
                      value={newDonation.quantity}
                      onChange={(e) =>
                        setNewDonation({ ...newDonation, quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={newDonation.unit}
                      onValueChange={(value) =>
                        setNewDonation({ ...newDonation, unit: value })
                      }
                    >
                      <SelectTrigger id="unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="units">units</SelectItem>
                        <SelectItem value="liters">liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={newDonation.expiryDate}
                    onChange={(e) =>
                      setNewDonation({ ...newDonation, expiryDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Pickup Location</Label>
                  <Input
                    id="location"
                    placeholder="Full address"
                    value={newDonation.location}
                    onChange={(e) =>
                      setNewDonation({ ...newDonation, location: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  List Donation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading donations...</p>
        ) : donations.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No donations yet. Click “List New Donation” to get started!
            </p>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <Card className="bg-gradient-hero">
                <CardHeader>
                  <CardTitle>Impact Summary</CardTitle>
                  <CardDescription>
                    Your contribution to the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-card p-4 shadow-soft">
                      <p className="text-sm text-muted-foreground">
                        Total Donations
                      </p>
                      <p className="text-3xl font-bold text-primary">
                        {donations.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card p-4 shadow-soft">
                      <p className="text-sm text-muted-foreground">
                        Active Listings
                      </p>
                      <p className="text-3xl font-bold text-warning">
                        {donations.filter((d) => d.status === "LISTED").length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-card p-4 shadow-soft">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-3xl font-bold text-success">
                        {donations.filter((d) => d.status === "DELIVERED").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {donations.map((donation) => (
                <DonationCard key={donation._id} {...donation} showActions={false} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DonorDashboard;
