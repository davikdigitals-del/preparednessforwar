import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown, CheckCircle, Loader2 } from "lucide-react";

interface PremiumGateProps {
  children: ReactNode;
  isPremium: boolean;
  contentType?: "article" | "video" | "document";
  showPreview?: boolean;
  previewContent?: ReactNode;
}

export function PremiumGate({
  children,
  isPremium,
  contentType = "article",
  showPreview = true,
  previewContent,
}: PremiumGateProps) {
  const { user } = useAuth();
  const { isPremium: hasPremiumAccess, loading } = usePremiumStatus();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If content is not premium, show it
  if (!isPremium) {
    return <>{children}</>;
  }

  // If user has premium access, show content
  if (hasPremiumAccess) {
    return <>{children}</>;
  }

  // Show premium gate
  return (
    <div className="relative">
      {/* Preview content (blurred) */}
      {showPreview && previewContent && (
        <div className="relative mb-6">
          <div className="blur-sm pointer-events-none select-none">
            {previewContent}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
        </div>
      )}

      {/* Premium gate card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>

          <h3 className="text-2xl font-bold mb-2">Premium Content</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This {contentType} is available exclusively to premium members. Upgrade now to unlock unlimited access.
          </p>

          {/* Premium benefits */}
          <div className="bg-white rounded-lg p-6 mb-6 max-w-md mx-auto text-left">
            <h4 className="font-semibold mb-3 flex items-center">
              <Crown className="w-5 h-5 text-primary mr-2" />
              Premium Benefits
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Unlimited access to all premium articles</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Exclusive videos and podcasts</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Full library access with downloadable resources</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Country-specific content and directives</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Ad-free experience</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/premium">
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/dashboard">View My Account</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link to="/signup">
                    <Crown className="w-4 h-4" />
                    Start Free Trial
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Already a premium member? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Inline premium badge component
export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold ${className}`}>
      <Crown className="w-3 h-3" />
      Premium
    </span>
  );
}

// Lock icon for premium content in lists
export function PremiumLockIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 ${className}`}>
      <Lock className="w-4 h-4 text-primary" />
    </div>
  );
}
