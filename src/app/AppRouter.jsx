import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import EquivalencyIntro from "../pages/EquivalencyIntro";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import EmailVerified from "../pages/EmailVerified";
import Roles from "../pages/Roles";
import Dashboard from "../pages/Dashboard";
import Forbidden from "../pages/Forbidden";
import NotFound from "../pages/NotFound";
import AppLayout from "../components/layout/AppLayout";
import { RequireAuth, RequirePermission } from "../auth/guards";
import { PERMISSIONS } from "../auth/permissions";
import { useAuth } from "../auth/AuthContext";
import Applications from "../pages/Applications";
import MyApplications from "../pages/MyApplications";
import NewApplication from "../pages/NewApplication";
import ApplicationDetails from "../pages/ApplicationDetails";
import Documents from "../pages/Documents";
import Payments from "../pages/Payments";
import Receiving from "../pages/Receiving";
import Inquiries from "../pages/Inquiries";
import Committees from "../pages/Committees";
import Printing from "../pages/Printing";
import DraftReview from "../pages/DraftReview";
import Archive from "../pages/Archive";
import Delivery from "../pages/Delivery";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import PostDecisionServices from "../pages/postDecision/PostDecisionServices";
import Settings from "../pages/Settings";
import AboutEquivalency from "../pages/AboutEquivalency";
import EquivalencyTypes from "../pages/EquivalencyTypes";
import RequirementsInfo from "../pages/RequirementsInfo";
import ApplicationSteps from "../pages/ApplicationSteps";
import FAQ from "../pages/FAQ";

function ProtectedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <AppLayout user={user} onLogout={logout} key={location.pathname}>
      <Routes>
        <Route path="/dashboard" element={<RequirePermission permission={PERMISSIONS.AUTHENTICATED}><Dashboard /></RequirePermission>} />
        <Route path="/applications" element={<RequirePermission permission={PERMISSIONS.VIEW_APPLICATIONS}><Applications /></RequirePermission>} />
        <Route path="/applications/new" element={<RequirePermission permission={PERMISSIONS.APPLICATION_CREATE}><NewApplication /></RequirePermission>} />
        <Route path="/applications/:id" element={<RequirePermission permissions={[PERMISSIONS.VIEW_APPLICATIONS, PERMISSIONS.APPLICATION_VIEW_OWN]} mode="any"><ApplicationDetails /></RequirePermission>} />
        <Route path="/my-applications" element={<RequirePermission permission={PERMISSIONS.APPLICATION_VIEW_OWN}><MyApplications /></RequirePermission>} />
        <Route path="/documents" element={<RequirePermission permission={PERMISSIONS.DOCUMENT_UPLOAD_OWN}><Documents /></RequirePermission>} />
        <Route path="/payments" element={<RequirePermission permission={PERMISSIONS.PAYMENT_VIEW_OWN}><Payments /></RequirePermission>} />
        <Route path="/receiving" element={<RequirePermission permission={PERMISSIONS.RECEIVE_PAPER}><Receiving /></RequirePermission>} />
        <Route path="/inquiries" element={<RequirePermission permission={PERMISSIONS.MANAGE_INQUIRIES}><Inquiries /></RequirePermission>} />
        <Route path="/committees" element={<RequirePermission permission={PERMISSIONS.COMMITTEE_VIEW}><Committees /></RequirePermission>} />
        <Route path="/printing" element={<RequirePermission permission={PERMISSIONS.PRINT_DRAFT}><Printing /></RequirePermission>} />
        <Route path="/draft-review" element={<RequirePermission permission={PERMISSIONS.DRAFT_REVIEW_OWN}><DraftReview /></RequirePermission>} />
        <Route path="/archive" element={<RequirePermission permission={PERMISSIONS.ARCHIVE_DOCUMENT}><Archive /></RequirePermission>} />
        <Route path="/delivery" element={<RequirePermission permission={PERMISSIONS.DELIVERY}><Delivery /></RequirePermission>} />
        <Route path="/reports" element={<RequirePermission permission={PERMISSIONS.REPORTS_VIEW}><Reports /></RequirePermission>} />
        <Route path="/users" element={<RequirePermission permission={PERMISSIONS.MANAGE_USERS}><Users /></RequirePermission>} />
        <Route path="/post-decision" element={<RequirePermission permission={PERMISSIONS.POST_DECISION_SERVICE_VIEW}><PostDecisionServices /></RequirePermission>} />
        <Route path="/roles" element={<RequirePermission permission={PERMISSIONS.VIEW_ROLE_PROFILE}><Roles /></RequirePermission>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<EquivalencyIntro />} />
      <Route path="/about-equivalency" element={<AboutEquivalency />} />
      <Route path="/equivalency-types" element={<EquivalencyTypes />} />
      <Route path="/requirements" element={<RequirementsInfo />} />
      <Route path="/application-steps" element={<ApplicationSteps />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-email/complete" element={<EmailVerified />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/*" element={<RequireAuth><ProtectedLayout /></RequireAuth>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
