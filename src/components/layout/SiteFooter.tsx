import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Preparedness for War</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted source for emergency preparedness and survival intelligence.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Content</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/latest" className="text-muted-foreground hover:text-primary transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/countries" className="text-muted-foreground hover:text-primary transition-colors">
                  Countries
                </Link>
              </li>
              <li>
                <Link to="/media" className="text-muted-foreground hover:text-primary transition-colors">
                  Media Hub
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-muted-foreground hover:text-primary transition-colors">
                  Library
                </Link>
              </li>
              <li>
                <Link to="/encyclopaedia" className="text-muted-foreground hover:text-primary transition-colors">
                  Encyclopaedia
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/newsletter" className="text-muted-foreground hover:text-primary transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Member Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Preparedness for War. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
