import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import SectionPage from "./pages/SectionPage";
import ArticlePage from "./pages/ArticlePage";
import CountriesPage from "./pages/CountriesPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import PublicLayout from "./pages/PublicLayout";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import MemberDashboard from "./pages/MemberDashboard";
import LibraryPage from "./pages/LibraryPage";
import EncyclopaediaPage from "./pages/EncyclopaediaPage";
import MediaHubPage from "./pages/MediaHubPage";
import AboutPage from "./pages/AboutPage";
import LegalPage from "./pages/LegalPage";
import LatestPage from "./pages/LatestPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSections from "./pages/admin/AdminSections";
import AdminPreparednessTemplates from "./pages/admin/AdminPreparednessTemplates";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminPodcastVideos from "./pages/admin/AdminPodcastVideos";
import AdminPages from "./pages/admin/AdminPages";
import AdminLibrary from "./pages/admin/AdminLibrary";
import AdminEncyclopaedia from "./pages/admin/AdminEncyclopaedia";
import AdminBanner from "./pages/admin/AdminBanner";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminReports from "./pages/admin/AdminReports";
import AdminComments from "./pages/admin/AdminComments";
import AdminMemberReports from "./pages/admin/AdminMemberReports";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseBuilder from "./pages/admin/AdminCourseBuilder";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminAffiliateProducts from "./pages/admin/AdminAffiliateProducts";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminAdvertisements from "./pages/admin/AdminAdvertisements";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminAds from "./pages/admin/AdminAds";
import AdminSponsorshipInquiries from "./pages/admin/AdminSponsorshipInquiries";
import NewsletterPage from "./pages/NewsletterPage";
import SubscribePage from "./pages/SubscribePage";
import MemberSubscription from "./pages/MemberSubscription";
import TagPage from "./pages/TagPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursePlayerPage from "./pages/CoursePlayerPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CheckoutPage from "./pages/CheckoutPage";
import ShopPage from "./pages/ShopPage";
import CommunityReports from "./pages/CommunityReports";
import SubmitReport from "./pages/dashboard/SubmitReport";
import MyReports from "./pages/dashboard/MyReports";
import OfflineContentManager from "./pages/dashboard/OfflineContentManager";
import MyBunker from "./pages/dashboard/MyBunker";
import DashboardHome from "./pages/dashboard/DashboardHome";
import TrainingAcademy from "./pages/dashboard/TrainingAcademy";
import AdvertiseWithUs from "./pages/dashboard/AdvertiseWithUs";
import SponsorshipInquiry from "./pages/dashboard/SponsorshipInquiry";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
                <Route path="/signup" element={<SignUpPage />} />
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
                <Route path="/countries" element={<CountriesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/latest" element={<LatestPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/encyclopaedia" element={<EncyclopaediaPage />} />
                <Route path="/media" element={<MediaHubPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/newsletter" element={<NewsletterPage />} />
                <Route path="/legal/:page" element={<LegalPage />} />
                <Route path="/privacy" element={<LegalPage />} />
                <Route path="/terms" element={<LegalPage />} />
                <Route path="/disclaimer" element={<LegalPage />} />
                <Route path="/tag/:tag" element={<TagPage />} />
                <Route path="/:section" element={<SectionPage />} />
                <Route path="/:section/:category" element={<SectionPage />} />
                <Route path="/:section/:category/:id" element={<ArticlePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
