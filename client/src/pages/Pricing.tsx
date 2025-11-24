import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Check, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "5 posts per month",
      "1 platform",
      "Basic templates",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For growing creators",
    period: "/month",
    features: [
      "Unlimited posts",
      "4 platforms",
      "50+ templates",
      "Team collaboration (2 members)",
      "Basic analytics",
      "Priority email support",
    ],
    cta: "Upgrade Now",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$49",
    description: "For professional teams",
    period: "/month",
    features: [
      "Unlimited posts",
      "All platforms",
      "100+ templates",
      "Team collaboration (10 members)",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "24/7 phone support",
    ],
    cta: "Upgrade Now",
    highlighted: false,
  },
];

const BANK_DETAILS = {
  accountName: "Content Calendar Lite",
  accountNumber: "1234567890",
  bankName: "Example Bank",
  swiftCode: "EXBLUS33",
};

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "business" | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  const { data: subscription } = trpc.subscription.current.useQuery();
  const { data: paymentRequests } = trpc.payment.getRequests.useQuery();
  const requestUpgradeMutation = trpc.payment.requestUpgrade.useMutation({
    onSuccess: () => {
      toast.success("Upgrade request submitted! Please provide payment proof.");
      setIsPaymentDialogOpen(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request upgrade");
    },
  });

  const updatePaymentMutation = trpc.payment.updateRequest.useMutation({
    onSuccess: () => {
      toast.success("Payment proof submitted! We'll review it shortly.");
      setProofUrl("");
      setIsPaymentDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit payment proof");
    },
  });

  const handleUpgrade = (planName: "pro" | "business") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (subscription?.plan === planName) {
      toast.info("You're already on this plan");
      return;
    }

    setSelectedPlan(planName);
    requestUpgradeMutation.mutate({ plan: planName });
  };

  const handleSubmitPaymentProof = () => {
    if (!selectedPlan || !proofUrl) {
      toast.error("Please provide payment proof URL");
      return;
    }

    const latestRequest = paymentRequests?.[0];
    if (!latestRequest) {
      toast.error("No pending payment request found");
      return;
    }

    updatePaymentMutation.mutate({
      id: latestRequest.id,
      paymentProof: proofUrl,
      notes: `Payment proof submitted for ${selectedPlan} plan upgrade`,
    } as any);
  };

  const pendingPayment = paymentRequests?.find((p: any) => p.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b border-white/20 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl font-bold text-gray-900">Content Calendar Lite</span>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your social media strategy
          </p>
        </div>

        {/* Pending Payment Alert */}
        {pendingPayment && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Payment Pending Review</p>
                <p className="text-sm text-yellow-800 mt-1">
                  Your upgrade request to <strong>{pendingPayment.plan}</strong> plan is pending. We'll review your payment proof and activate your plan shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${
                plan.highlighted
                  ? "border-2 border-blue-600 shadow-xl scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === "Free" ? (
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = getLoginUrl();
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan.name.toLowerCase() as "pro" | "business")}
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={requestUpgradeMutation.isPending}
                  >
                    {subscription?.plan === plan.name.toLowerCase() ? "Current Plan" : (plan.name === "Free" ? "Get Started" : plan.cta)}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Instructions */}
        <Card className="mt-16 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>How to Upgrade</CardTitle>
            <CardDescription>Manual payment process for regions without Stripe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Step 1: Request Upgrade</h3>
                <p className="text-gray-600 mb-4">
                  Click "Upgrade Now" on your desired plan. This creates a payment request in your account.
                </p>

                <h3 className="font-semibold text-gray-900 mb-4 mt-6">Step 2: Make Payment</h3>
                <p className="text-gray-600 mb-4">Transfer the amount to our bank account:</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Account Name</p>
                    <p className="font-mono font-semibold">{BANK_DETAILS.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-mono font-semibold">{BANK_DETAILS.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-mono font-semibold">{BANK_DETAILS.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SWIFT Code</p>
                    <p className="font-mono font-semibold">{BANK_DETAILS.swiftCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Step 3: Submit Proof</h3>
                <p className="text-gray-600 mb-4">
                  Upload a screenshot or photo of your payment receipt/proof of transfer.
                </p>

                <h3 className="font-semibold text-gray-900 mb-4 mt-6">Step 4: Verification</h3>
                <p className="text-gray-600 mb-4">
                  We'll verify your payment within 24 hours and activate your plan. You'll receive an email confirmation.
                </p>

                {isAuthenticated && pendingPayment && (
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4">Submit Payment Proof</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Payment Proof</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="proofUrl">Payment Proof URL</Label>
                          <p className="text-sm text-gray-600 mb-2">
                            Upload your payment receipt to a service like Imgur or Google Drive and paste the link here.
                          </p>
                          <Input
                            id="proofUrl"
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            placeholder="https://imgur.com/..."
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsPaymentDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmitPaymentProof}
                            disabled={updatePaymentMutation.isPending || !proofUrl}
                          >
                            {updatePaymentMutation.isPending ? "Submitting..." : "Submit Proof"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately after payment verification.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee if you're not satisfied with your purchase.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept bank transfers. Send us your payment proof and we'll verify it within 24 hours.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does verification take?
              </h3>
              <p className="text-gray-600">
                Typically 24 hours. We'll send you an email once your payment is verified and your plan is activated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Content Calendar Lite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
