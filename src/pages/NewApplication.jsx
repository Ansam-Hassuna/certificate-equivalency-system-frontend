import React from "react";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import ApplicationSubmissionFlow from "./ApplicationSubmissionFlow";

export default function NewApplication() {
  return <RequirePermission permission={PERMISSIONS.APPLICATION_CREATE}><ApplicationSubmissionFlow /></RequirePermission>;
}
