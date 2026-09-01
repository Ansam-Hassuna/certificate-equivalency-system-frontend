import { PERMISSIONS } from "../auth/permissions";

export const NAVIGATION = Object.freeze([
  { id: "dashboard", labelKey: "navigation.dashboard", path: "/dashboard", permission: PERMISSIONS.AUTHENTICATED, icon: "dashboard" },
  { id: "applications", labelKey: "navigation.applications", path: "/applications", permission: PERMISSIONS.VIEW_APPLICATIONS, icon: "document" },
  { id: "myApplications", labelKey: "navigation.myApplications", path: "/my-applications", permission: PERMISSIONS.APPLICATION_VIEW_OWN, icon: "document" },
  { id: "newApplication", labelKey: "navigation.newApplication", path: "/applications/new", permission: PERMISSIONS.APPLICATION_CREATE, icon: "plus" },
  { id: "documents", labelKey: "navigation.documents", path: "/documents", permission: PERMISSIONS.DOCUMENT_UPLOAD_OWN, icon: "document" },
  { id: "payments", labelKey: "navigation.payments", path: "/payments", permission: PERMISSIONS.PAYMENT_VIEW_OWN, icon: "payment" },
  { id: "receiving", labelKey: "navigation.receiving", path: "/receiving", permission: PERMISSIONS.RECEIVE_PAPER, icon: "archive" },
  { id: "inquiries", labelKey: "navigation.inquiries", path: "/inquiries", permission: PERMISSIONS.MANAGE_INQUIRIES, icon: "search" },
  { id: "committees", labelKey: "navigation.committees", path: "/committees", permission: PERMISSIONS.COMMITTEE_VIEW, icon: "users" },
  { id: "printing", labelKey: "navigation.printing", path: "/printing", permission: PERMISSIONS.PRINT_DRAFT, icon: "print" },
  { id: "archive", labelKey: "navigation.archive", path: "/archive", permission: PERMISSIONS.ARCHIVE_DOCUMENT, icon: "archive" },
  { id: "postDecision", labelKey: "navigation.postDecision", path: "/post-decision", permission: PERMISSIONS.POST_DECISION_SERVICE_VIEW, icon: "check" },
  { id: "delivery", labelKey: "navigation.delivery", path: "/delivery", permission: PERMISSIONS.DELIVERY, icon: "check" },
  { id: "reports", labelKey: "navigation.reports", path: "/reports", permission: PERMISSIONS.REPORTS_VIEW, icon: "reports" },
  { id: "users", labelKey: "navigation.users", path: "/users", permission: PERMISSIONS.MANAGE_USERS, icon: "users" },
]);
