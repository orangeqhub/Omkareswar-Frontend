import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RequirePermission from '../components/common/RequirePermission';
import RouteLoadingFallback from '../components/common/RouteLoadingFallback';

import Home from '../pages/public/Home';
import PropertyListing from '../pages/public/PropertyListing';
import PropertyDetail from '../pages/public/PropertyDetail';
import Ventures from '../pages/public/Ventures';
import About from '../pages/public/About';
import Wishlist from '../pages/public/Wishlist';
import PostPropertyType from '../pages/public/PostPropertyType';
import Unauthorized from '../pages/public/Unauthorized';
import NotFound from '../pages/public/NotFound';

import Register from '../pages/auth/Register';
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import EmployeeLogin from '../pages/auth/EmployeeLogin';
import ApplicationStatus from '../pages/auth/ApplicationStatus';
import PortalAreaGate from '../components/common/PortalAreaGate';

// Dashboards, Recharts pages and other heavy admin modules are code-split
// per-route: each role's pages only download once that role's dashboard is
// actually visited, instead of bloating the initial public-site bundle.
const BuyerDashboard = lazy(() => import('../pages/buyer/Dashboard'));
const BuyerBrowseProperties = lazy(() => import('../pages/buyer/BrowseProperties'));
const BuyerFavourites = lazy(() => import('../pages/buyer/Favourites'));
const BuyerInterests = lazy(() => import('../pages/buyer/Interests'));
const BuyerVisits = lazy(() => import('../pages/buyer/Visits'));
const BuyerCompare = lazy(() => import('../pages/buyer/Compare'));
const BuyerProfile = lazy(() => import('../pages/buyer/Profile'));
const BuyerSavedSearches = lazy(() => import('../pages/buyer/SavedSearches'));
const BuyerNotifications = lazy(() => import('../pages/buyer/Notifications'));
const BuyerSettings = lazy(() => import('../pages/buyer/Settings'));
const BuyerMyProperties = lazy(() => import('../pages/seller/MyProperties'));
const BuyerAddProperty = lazy(() => import('../pages/seller/AddProperty'));
const BuyerEditProperty = lazy(() => import('../pages/seller/EditProperty'));

const SellerDashboard = lazy(() => import('../pages/seller/Dashboard'));
const SellerMyProperties = lazy(() => import('../pages/seller/MyProperties'));
const SellerAddProperty = lazy(() => import('../pages/seller/AddProperty'));
const SellerEditProperty = lazy(() => import('../pages/seller/EditProperty'));
const SellerEnquiries = lazy(() => import('../pages/seller/Enquiries'));
const SellerVisits = lazy(() => import('../pages/seller/Visits'));
const SellerProfile = lazy(() => import('../pages/buyer/Profile'));
const SellerAnalytics = lazy(() => import('../pages/seller/Analytics'));
const SellerNotifications = lazy(() => import('../pages/buyer/Notifications'));
const SellerSettings = lazy(() => import('../pages/seller/Settings'));

const MediatorDashboard = lazy(() => import('../pages/mediator/Dashboard'));
const MediatorAddProperty = lazy(() => import('../pages/seller/AddProperty'));
const MediatorLeads = lazy(() => import('../pages/mediator/Leads'));
const MediatorProperties = lazy(() => import('../pages/mediator/Properties'));
const MediatorVisits = lazy(() => import('../pages/mediator/Visits'));
const MediatorFollowUps = lazy(() => import('../pages/mediator/FollowUps'));
const MediatorProfile = lazy(() => import('../pages/buyer/Profile'));
const MediatorCommissionHistory = lazy(() => import('../pages/mediator/CommissionHistory'));
const MediatorNotifications = lazy(() => import('../pages/buyer/Notifications'));
const MediatorSettings = lazy(() => import('../pages/mediator/Settings'));

const EmployeeDashboard = lazy(() => import('../pages/employee/Dashboard'));
const EmployeeVerifications = lazy(() => import('../pages/employee/Verifications'));
const EmployeeVerificationDetail = lazy(() => import('../pages/employee/VerificationDetail'));
const EmployeeProperties = lazy(() => import('../pages/employee/Properties'));
const EmployeePropertyDetail = lazy(() => import('../pages/employee/PropertyModerationDetail'));
const EmployeeEnquiries = lazy(() => import('../pages/employee/Enquiries'));
const EmployeeEnquiryDetail = lazy(() => import('../pages/employee/EnquiryDetail'));
const EmployeeVisits = lazy(() => import('../pages/employee/Visits'));
const EmployeeFollowUps = lazy(() => import('../pages/employee/FollowUps'));
const EmployeeNotifications = lazy(() => import('../pages/employee/Notifications'));
const EmployeeReports = lazy(() => import('../pages/employee/Reports'));
const EmployeeProfile = lazy(() => import('../pages/buyer/Profile'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminRegistrations = lazy(() => import('../pages/admin/Registrations'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminEmployees = lazy(() => import('../pages/admin/Employees'));
const AdminProperties = lazy(() => import('../pages/admin/Properties'));
const AdminCategories = lazy(() => import('../pages/admin/Categories'));
const AdminMediaRules = lazy(() => import('../pages/admin/MediaRules'));
const AdminCms = lazy(() => import('../pages/admin/Cms'));
const AdminEnquiries = lazy(() => import('../pages/admin/Enquiries'));
const AdminVisits = lazy(() => import('../pages/admin/Visits'));
const AdminFollowUps = lazy(() => import('../pages/admin/FollowUps'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminNotifications = lazy(() => import('../pages/admin/Notifications'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

function DashboardRoute({ role }) {
  return (
    <ProtectedRoute roles={[role]}>
      <DashboardLayout role={role} />
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/properties/category/:categorySlug" element={<PropertyListing />} />
          <Route path="/properties/:propertyId" element={<PropertyDetail />} />
          <Route path="/ventures" element={<Ventures />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Navigate to="/about#contact" replace />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/post-property"
            element={
              <ProtectedRoute roles={['buyer', 'seller', 'mediator']}>
                <PostPropertyType />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/register/:role" element={<Navigate to="/register" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/application-status" element={<ApplicationStatus />} />
        </Route>

        <Route path="/buyer" element={<DashboardRoute role="buyer" />}>
          <Route path="dashboard" element={<BuyerDashboard />} />
          <Route path="properties" element={<BuyerBrowseProperties />} />
          <Route path="favourites" element={<BuyerFavourites />} />
          <Route path="interests" element={<BuyerInterests />} />
          <Route path="visits" element={<BuyerVisits />} />
          <Route path="compare" element={<BuyerCompare />} />
          <Route path="profile" element={<BuyerProfile />} />
          <Route path="saved-searches" element={<BuyerSavedSearches />} />
          <Route path="notifications" element={<BuyerNotifications />} />
          <Route path="settings" element={<BuyerSettings />} />
          <Route path="my-properties" element={<BuyerMyProperties basePath="/buyer/properties" />} />
          <Route path="properties/new" element={<BuyerAddProperty />} />
          <Route path="properties/:id/edit" element={<BuyerEditProperty />} />
        </Route>

        <Route path="/seller" element={<DashboardRoute role="seller" />}>
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="properties" element={<SellerMyProperties />} />
          <Route path="properties/new" element={<SellerAddProperty />} />
          <Route path="properties/:id/edit" element={<SellerEditProperty />} />
          <Route path="enquiries" element={<SellerEnquiries />} />
          <Route path="visits" element={<SellerVisits />} />
          <Route path="profile" element={<SellerProfile />} />
          <Route path="analytics" element={<SellerAnalytics />} />
          <Route path="notifications" element={<SellerNotifications />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>

        <Route path="/mediator" element={<DashboardRoute role="mediator" />}>
          <Route path="dashboard" element={<MediatorDashboard />} />
          <Route path="leads" element={<MediatorLeads />} />
          <Route path="properties" element={<MediatorProperties />} />
          <Route path="properties/new" element={<MediatorAddProperty />} />
          <Route path="visits" element={<MediatorVisits />} />
          <Route path="follow-ups" element={<MediatorFollowUps />} />
          <Route path="profile" element={<MediatorProfile />} />
          <Route path="commission" element={<MediatorCommissionHistory />} />
          <Route path="notifications" element={<MediatorNotifications />} />
          <Route path="settings" element={<MediatorSettings />} />
        </Route>

        <Route
          path="/employee"
          element={<PortalAreaGate role="employee" dashboardPath="/employee/dashboard" LoginComponent={EmployeeLogin} />}
        >
          <Route
            path="dashboard"
            element={<RequirePermission permission="EMPLOYEE_DASHBOARD_VIEW"><EmployeeDashboard /></RequirePermission>}
          />
          <Route
            path="verifications"
            element={<RequirePermission permission="USER_VERIFICATION_VIEW"><EmployeeVerifications /></RequirePermission>}
          />
          <Route
            path="verifications/:id"
            element={<RequirePermission permission="USER_VERIFICATION_VIEW"><EmployeeVerificationDetail /></RequirePermission>}
          />
          <Route
            path="properties"
            element={<RequirePermission permission="PROPERTY_MODERATION_VIEW"><EmployeeProperties /></RequirePermission>}
          />
          <Route
            path="properties/:id"
            element={<RequirePermission permission="PROPERTY_MODERATION_VIEW"><EmployeePropertyDetail /></RequirePermission>}
          />
          <Route
            path="enquiries"
            element={<RequirePermission permission="ENQUIRY_VIEW"><EmployeeEnquiries /></RequirePermission>}
          />
          <Route
            path="enquiries/:id"
            element={<RequirePermission permission="ENQUIRY_VIEW"><EmployeeEnquiryDetail /></RequirePermission>}
          />
          <Route
            path="visits"
            element={<RequirePermission permission="VISIT_VIEW"><EmployeeVisits /></RequirePermission>}
          />
          <Route
            path="follow-ups"
            element={<RequirePermission permission="FOLLOWUP_VIEW"><EmployeeFollowUps /></RequirePermission>}
          />
          <Route
            path="notifications"
            element={<RequirePermission permission="NOTIFICATIONS_VIEW"><EmployeeNotifications /></RequirePermission>}
          />
          <Route
            path="reports"
            element={<RequirePermission permission="REPORTS_VIEW"><EmployeeReports /></RequirePermission>}
          />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>

        <Route
          path="/admin"
          element={<PortalAreaGate role="admin" dashboardPath="/admin/dashboard" LoginComponent={AdminLogin} />}
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="media-rules" element={<AdminMediaRules />} />
          <Route path="cms" element={<AdminCms />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="visits" element={<AdminVisits />} />
          <Route path="follow-ups" element={<AdminFollowUps />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
