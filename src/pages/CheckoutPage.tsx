import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, CreditCard, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/types/monetization";

export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    country: "US",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, user, authLoading]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      // Check if already enrolled
      if (user) {
        const { data: enrollmentData } = await supabase
          .from("course_enrollments")
          .select("*")
          .eq("course_id", courseId)
          .eq("user_id", user.id)
          .single();

        if (enrollmentData) {
          toast({
            title: "Already Enrolled",
            description: "You're already enrolled in this course",
          });
          navigate(`/courses/${data.slug}/learn`);
          return;
        }
      }

      setCourse(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!course || !user) return;

    setProcessing(true);

    try {
      // In production, this would integrate with Stripe
      // For now, we'll create a mock successful payment
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from("course_enrollments")
        .insert([
          {
            course_id: course.id,
            user_id: user.id,
            payment_status: "completed",
            payment_amount: course.price,
            payment_currency: course.currency,
            stripe_payment_id: `mock_${Date.now()}`,
            progress_percentage: 0,
            completed_lessons: [],
          },
        ]);

      if (enrollmentError) throw enrollmentError;

      // Create revenue transaction
      await supabase.from("revenue_transactions").insert([
        {
          transaction_type: "course_sale",
          course_id: course.id,
          amount: course.price,
          currency: course.currency,
          payment_method: "card",
          payment_reference: `mock_${Date.now()}`,
          status: "completed",
          country_code: formData.country,
          transaction_date: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
      ]);

      toast({
        title: "Payment Successful!",
        description: "You're now enrolled in the course",
      });

      navigate(`/courses/${course.slug}/learn`);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase to start learning</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-6 h-6 text-blue-900" />
                <h2 className="text-2xl font-bold">Payment Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    required
                    maxLength={19}
                  />
                </div>

                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      required
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      required
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">Secure Payment</p>
                    <p className="text-blue-800">
                      Your payment information is encrypted and secure. We use industry-standard SSL encryption.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay £{course.price} {course.currency}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="w-6 h-6 text-blue-900" />
                <h2 className="text-xl font-bold">Order Summary</h2>
              </div>

              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full aspect-video object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-bold text-lg mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">by {course.instructor_name}</p>

              <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Course Price</span>
                  <span className="font-semibold">£{course.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">£0.00</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-900">
                    £{course.price} {course.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Lifetime access to course content</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
