import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "pfw-cookie-consent";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(necessaryOnly);
    setShowBanner(false);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString(),
    }));
    // Here you would typically initialize analytics/marketing scripts based on preferences
    if (prefs.analytics) {
      // Initialize analytics
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Initialize marketing/advertising cookies
      console.log("Marketing cookies enabled");
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-card border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-alert/10 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-alert" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg mb-2">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, provide personalised content, 
                and analyse our traffic. By clicking "Accept All", you consent to our use of cookies. 
                You can manage your preferences or learn more in our{" "}
                <Link to="/legal/cookies" className="text-alert hover:underline font-medium">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessary}
              >
                Necessary Only
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-alert hover:bg-alert/90"
              >
                Accept All
              </Button>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={acceptNecessary}
              className="absolute top-3 right-3 md:hidden text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Cookie className="w-6 h-6 text-alert" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="text-base">
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="font-semibold text-base">Necessary Cookies</Label>
                  <span className="text-xs bg-alert/10 text-alert px-2 py-0.5 rounded">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Essential for the website to function properly. These cookies enable basic functions 
                  like page navigation, access to secure areas, and remember your preferences.
                </p>
              </div>
              <Checkbox
                checked={true}
                disabled
                className="mt-1"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1">
                <Label className="font-semibold text-base mb-2 block">
                  Analytics Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website by collecting and 
                  reporting information anonymously. This helps us improve our content and user experience.
                </p>
              </div>
              <Checkbox
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked as boolean })
                }
                className="mt-1"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg">
              <div className="flex-1">
                <Label className="font-semibold text-base mb-2 block">
                  Marketing Cookies
                </Label>
                <p className="text-sm text-muted-foreground">
                  Used to track visitors across websites to display relevant advertisements. 
                  These cookies help us show you content that might be of interest to you.
                </p>
              </div>
              <Checkbox
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked as boolean })
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPreferences({
                  necessary: true,
                  analytics: false,
                  marketing: false,
                });
                saveCustomPreferences();
              }}
              className="flex-1"
            >
              Reject All
            </Button>
            <Button
              onClick={saveCustomPreferences}
              className="flex-1 bg-alert hover:bg-alert/90"
            >
              Save Preferences
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              For more information, please read our{" "}
              <Link to="/legal/cookies" className="text-alert hover:underline">
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link to="/legal/privacy" className="text-alert hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
