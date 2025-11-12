import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Truck, BarChart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import StatusTimeline from "@/components/StatusTimeline";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Easy Donation Listing",
      description: "Donors can quickly list surplus food with details about quantity, type, and expiry.",
    },
    {
      icon: Users,
      title: "Connect with NGOs",
      description: "NGOs and volunteers can browse and claim donations in their area.",
    },
    {
      icon: Truck,
      title: "Live Tracking",
      description: "Track donation status from listing to delivery in real-time.",
    },
    {
      icon: BarChart,
      title: "Impact Dashboard",
      description: "View your contribution and impact on the community with detailed analytics.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Kind Meal</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button onClick={() => navigate("/auth")}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-in">
              <h2 className="mb-6 text-5xl font-bold leading-tight">
                Connecting Food Donors with Those in Need
              </h2>
              <p className="mb-8 text-xl text-muted-foreground">
                A centralized platform for food redistribution. Help reduce food waste while
                supporting your community through seamless donation management.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="shadow-medium" onClick={() => navigate("/auth")}>
                  Start Donating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-soft"
                  onClick={() => navigate("/auth")}
                >
                  I'm an NGO/Volunteer
                </Button>
              </div>
            </div>
            <div className="animate-scale-in">
              <img
                src={heroImage}
                alt="Community food sharing illustration"
                className="h-auto w-full rounded-2xl shadow-large"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold">How It Works</h3>
            <p className="text-xl text-muted-foreground">
              Simple steps to make a difference in your community
            </p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="animate-slide-up shadow-soft transition-all hover:shadow-medium"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Timeline Demo */}
          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Track Every Step</CardTitle>
              <CardDescription>
                From listing to delivery, always know where your donation is
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusTimeline currentStatus="PICKED" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-6 text-4xl font-bold">Ready to Make an Impact?</h3>
          <p className="mb-8 text-xl opacity-90">
            Join our community of donors, NGOs, and volunteers working together to end food waste
            and hunger.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="shadow-large"
            onClick={() => navigate("/auth")}
          >
            Join Kind Meal Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Kind Meal</span>
              </div>
              <p className="text-muted-foreground">
                Building a world without food waste, one meal at a time.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">For Donors</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>List Donations</li>
                <li>Track Impact</li>
                <li>Community Guidelines</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">For Recipients</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Browse Donations</li>
                <li>Claim Food</li>
                <li>Volunteer Programs</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2025 Kind Meal. Building a better tomorrow together.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
