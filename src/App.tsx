import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CookieConsent from "@/components/CookieConsent";
import { useSecurity } from "@/hooks/useSecurity";

// Core public pages — loaded immediately
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import PublicLayout from "./pages/PublicLayout";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages — only loaded when visited
const SectionPage = lazy(() => import("./pages/SectionPage"));
const CountriesPage = lazy(() => import("./pages/CountriesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const MemberDashboard = lazy(() => import("./pages/MemberDashboard"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const EncyclopaediaPage = lazy(() => import("./pages/EncyclopaediaPage"));
const MediaHubPage = lazy(() => import("./pages/MediaHubPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const LatestPage = lazy(() => import("./pages/LatestPage"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const SubscribePage = lazy(() => import("./pages/SubscribePage"));
const MemberSubscription = lazy(() => import("./pages/MemberSubscription"));
const TagPage = lazy(() => import("./pages/TagPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"));
const CoursePlayerPage = lazy(() => import("./pages/CoursePlayerPage"));
const MyCoursesPage = lazy(() => import("./pages/MyCoursesPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const CommunityReports = lazy(() => import("./pages/CommunityReports"));
const DebugFeaturedPosts = lazy(() => import("./pages/DebugFeaturedPosts"));

// Dashboard pages
const SubmitReport = lazy(() => import("./pages/dashboard/SubmitReport"));
const MyReports = lazy(() => import("./pages/dashboard/MyReports"));
const OfflineContentManager = lazy(() => import("./pages/dashboard/OfflineContentManager"));
const MyBunker = lazy(() => import("./pages/dashboard/MyBunker"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const TrainingAcademy = lazy(() => import("./pages/dashboard/TrainingAcademy"));
const AdvertiseWithUs = lazy(() => import("./pages/dashboard/AdvertiseWithUs"));
const SponsorshipInquiry = lazy(() => import("./pages/dashboard/SponsorshipInquiry"));

// Admin pages — all lazy loaded (never needed by public users)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminPosts = lazy(() => import("./pages/admin/AdminPosts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminSections = lazy(() => import("./pages/admin/AdminSections"));
const AdminPreparednessTemplates = lazy(() => import("./pages/admin/AdminPreparednessTemplates"));
const AdminAlerts = lazy(() => import("./pages/admin/AdminAlerts"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminPodcastVideos = lazy(() => import("./pages/admin/AdminPodcastVideos"));
const AdminPages = lazy(() => import("./pages/admin/AdminPages"));
const AdminLibrary = lazy(() => import("./pages/admin/AdminLibrary"));
const AdminEncyclopaedia = lazy(() => import("./pages/admin/AdminEncyclopaedia"));
const AdminBanner = lazy(() => import("./pages/admin/AdminBanner"));
const AdminSiteSettings = lazy(() => import("./pages/admin/AdminSiteSettings"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminCountries = lazy(() => import("./pages/admin/AdminCountries"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminComments = lazy(() => import("./pages/admin/AdminComments"));
const AdminMemberReports = lazy(() => import("./pages/admin/AdminMemberReports"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseBuilder = lazy(() => import("./pages/admin/AdminCourseBuilder"));
const AdminEnrollments = lazy(() => import("./pages/admin/AdminEnrollments"));
const AdminAffiliateProducts = lazy(() => import("./pages/admin/AdminAffiliateProducts"));
const AdminSponsors = lazy(() => import("./pages/admin/AdminSponsors"));
const AdminAdvertisements = lazy(() => import("./pages/admin/AdminAdvertisements"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminAds = lazy(() => import("./pages/admin/AdminAds"));
const AdminSponsorshipInquiries = lazy(() => import("./pages/admin/AdminSponsorshipInquiries"));

const queryClient = new QueryClient();

// Loading fallback for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  // Initialize security protection
  useSecurity();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <LanguageProvider>
          <TooltipProvider>
            <Toaster />
          <Sonner />
          <BrowserRouter>
            <CookieConsent />
            <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="sections" element={<AdminSections />} />
                <Route path="preparedness-templates" element={<AdminPreparednessTemplates />} />
                <Route path="alerts" element={<AdminAlerts />} />
                <Route path="banner" element={<AdminBanner />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="podcast-videos" element={<AdminPodcastVideos />} />
                <Route path="library" element={<AdminLibrary />} />
                <Route path="encyclopaedia" element={<AdminEncyclopaedia />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="settings" element={<AdminSiteSettings />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:id/builder" element={<AdminCourseBuilder />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="affiliate-products" element={<AdminAffiliateProducts />} />
                <Route path="sponsors" element={<AdminSponsors />} />
                <Route path="advertisements" element={<AdminAdvertisements />} />
                <Route path="revenue" element={<AdminRevenue />} />
                <Route path="ads" element={<AdminAds />} />
                <Route path="sponsorships" element={<AdminSponsorshipInquiries />} />
                <Route path="countries" element={<AdminCountries />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="comments" element={<AdminComments />} />
                <Route path="member-reports" element={<AdminMemberReports />} />
              </Route>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<SignInPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/subscribe" element={<SubscribePage />} />
                <Route path="/dashboard" element={<MemberDashboard />} />
                <Route path="/dashboard/home" element={<DashboardHome />} />
                <Route path="/dashboard/training" element={<TrainingAcademy />} />
                <Route path="/dashboard/submit-report" element={<SubmitReport />} />
                <Route path="/dashboard/my-reports" element={<MyReports />} />
                <Route path="/dashboard/offline-content" element={<OfflineContentManager />} />
                <Route path="/dashboard/my-bunker" element={<MyBunker />} />
                <Route path="/dashboard/advertise" element={<AdvertiseWithUs />} />
                <Route path="/dashboard/my-ads" element={<AdvertiseWithUs />} />
                <Route path="/dashboard/sponsorship" element={<SponsorshipInquiry />} />
                <Route path="/my-subscription" element={<MemberSubscription />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:slug" element={<CourseDetailPage />} />
                <Route path="/courses/:slug/learn" element={<CoursePlayerPage />} />
                <Route path="/my-courses" element={<MyCoursesPage />} />
                <Route path="/checkout/course/:courseId" element={<CheckoutPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/community-reports" element={<CommunityReports />} />
                <Route path="/debug/featured-posts" element={<DebugFeaturedPosts />} />
                <Route path="/countries" element={<CountriesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/latest" element={<LatestPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/encyclopaedia" element={<EncyclopaediaPage />} />
                <Route path="/media" element={<MediaHubPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/newsletter" element={<NewsletterPage />} />
                <Route path="/legal/:page" element={<LegalPage />} />
                <Route path="/about-us" element={<LegalPage />} />
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/cookies" element={<LegalPage />} />
                <Route path="/disclaimer" element={<LegalPage />} />
                <Route path="/tag/:tag" element={<TagPage />} />
                <Route path="/:section" element={<SectionPage />} />
                <Route path="/:section/:category" element={<SectionPage />} />
                <Route path="/:section/:category/:id" element={<ArticlePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
