import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import { useAuthorization } from "../auth/useAuthorization";
import { useAuth } from "../auth/AuthContext";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { WORKFLOW_STAGES, WORKFLOW_STEPS } from "../config/workflow";
import { REQUEST_ROWS, getLocalizedRequestRows } from "./workflow/data";
import { getDeliveryState, isDeliveryCompleted } from "../features/delivery";
import "./workflow/OperationalWorkflow.css";

function Content() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const { language, t } = useLanguage();

  const ar = language === "ar";
  const isApplicant = user?.role === "APPLICANT";
  const canReceive = can(PERMISSIONS.RECEIVE_PAPER);
  const canDeliver = can(PERMISSIONS.DELIVERY);
  const [deliveryState, setDeliveryState] = useState(null);

  const localizedRequests = getLocalizedRequestRows(language);

  const request = localizedRequests.find(
    (row) => row.id === id
  );

  
  useEffect(() => {
    let active = true;

    getDeliveryState(id)
      .then((state) => {
        if (active) {
          setDeliveryState(state);
        }
      })
      .catch(() => {
        if (active) {
          setDeliveryState(null);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);
const isOwnRequest =
    Boolean(request) &&
    request.ownerUserId === user?.id;

  /*
   * Applicant users may only open their own requests.
   * Staff users with VIEW_APPLICATIONS are allowed to
   * open requests within their permission scope.
   */
  if (isApplicant && !isOwnRequest) {
    return (
      <ScreenShell
        title={ar ? "غير مسموح" : "Not allowed"}
        description={
          ar
            ? "لا يمكنك عرض طلبات مستخدمين آخرين."
            : "You cannot view another applicant’s request."
        }
        icon="shield"
      />
    );
  }

  if (!request) {
    return (
      <ScreenShell
        title={ar ? "الطلب غير موجود" : "Request not found"}
        description={
          ar
            ? "لم يتم العثور على الطلب المطلوب."
            : "The requested application could not be found."
        }
        icon="document"
      />
    );
  }

  const currentStageByStatus = {
    UNDER_REVIEW: WORKFLOW_STAGES.STUDY,
    AWAITING_INQUIRY: WORKFLOW_STAGES.INQUIRY_WAITING,
    COMMITTEE: WORKFLOW_STAGES.SPECIALIZED_COMMITTEE,
    DRAFT_REVIEW: WORKFLOW_STAGES.DRAFT,
    COMPLETED: WORKFLOW_STAGES.DELIVERY,
  };

  const deliveryCompleted =
    isDeliveryCompleted(deliveryState);

  const current =
    deliveryCompleted ||
    deliveryState?.status === "READY"
      ? WORKFLOW_STAGES.DELIVERY
      : currentStageByStatus[request.statusKey] ||
        WORKFLOW_STAGES.SUBMITTED;

  const labels = ar
    ? {
        title: "تفاصيل الطلب",
        description: "متابعة بيانات الطلب ومراحل سيره الفعلية.",
        summary: "ملخص الطلب",
        applicant: "مقدم الطلب",
        qualification: "المؤهل",
        university: "الجامعة / المؤسسة",
        status: "الحالة",
        timeline: "المراحل",
        completed: "مكتملة",
        active: "المرحلة الحالية",
        pending: "لاحقًا",
        inquiry: "الاستفسار عن صحة الشهادة",
        waiting: "حالة الاستفسار",
        waitingText:
          "يتم تحديث هذه الحالة وفق آخر إجراء مسجل على الطلب.",
        separation:
          "التصديق خدمة مرتبطة بالحركة الورقية وليست مدمجة مع قرار المعادلة.",
        payment:
          "تم تأكيد الدفع قبل تسليم الوثائق الورقية.",
        receive: "فتح استلام الوثائق",
        delivery: "فتح التسليم",
      }
    : {
        title: "Application Details",
        description:
          "Follow the request data and its actual workflow stages.",
        summary: "Request summary",
        applicant: "Applicant",
        qualification: "Qualification",
        university: "University / institution",
        status: "Status",
        timeline: "Stages",
        completed: "Completed",
        active: "Current stage",
        pending: "Later",
        inquiry: "Credential verification inquiry",
        waiting: "Inquiry status",
        waitingText:
          "This status reflects the latest recorded action on the request.",
        separation:
          "Certification is handled as a separate movement around the paper-document stage and is not merged with the equivalency decision.",
        payment:
          "Payment has been confirmed before paper documents were delivered.",
        receive: "Open paper receipt",
        delivery: "Open delivery",
      };

  const activeIndex = WORKFLOW_STEPS.findIndex(
    (step) => step.key === current
  );

  const currentIndex =
    activeIndex >= 0 ? activeIndex : 0;

  return (
    <ScreenShell
      title={`${labels.title} ${request.id}`}
      description={labels.description}
      icon="document"
    >
      <div className="operational-workflow">

        <div className="workflow-grid">

          <Card title={labels.summary}>
            <div className="workflow-detail-grid">

              <div>
                <span>{labels.applicant}</span>
                <strong>
                  {request.applicant || "—"}
                </strong>
              </div>

              <div>
                <span>{labels.qualification}</span>
                <strong>
                  {request.qualification || "—"}
                </strong>
              </div>

              <div>
                <span>{labels.university}</span>
                <strong>
                  {request.university || "—"}
                </strong>
              </div>

              <div>
                <span>{labels.status}</span>
                <strong>
                  <Badge
                    tone={
                      request.statusKey === "COMPLETED"
                        ? "success"
                        : request.statusKey === "AWAITING_INQUIRY" ||
                          request.statusKey === "DRAFT_REVIEW"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {request.status}
                  </Badge>
                </strong>
              </div>

            </div>
          </Card>

          <Card title={labels.inquiry}>
            <div className="workflow-note">
              <strong>{labels.waiting}</strong>
              <p>
                {request.statusKey === "AWAITING_INQUIRY"
                  ? labels.waitingText
                  : ar
                  ? "لا يوجد استفسار نشط حاليًا على الطلب."
                  : "There is no active inquiry currently recorded for this request."}
              </p>
            </div>
          </Card>

        </div>

        <Card>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {canReceive && (
              <button
                type="button"
                className="ui-button"
                onClick={() => {
                  navigate(
                    `/receiving?applicationId=${encodeURIComponent(request.id)}`
                  );
                }}
              >
                {labels.receive}
              </button>
            )}

            {canDeliver && (
              <button
                type="button"
                className="ui-button"
                onClick={() => {
                  navigate({ pathname: "/delivery", search: "?applicationId=" + encodeURIComponent(request.id) });
                }}
              >
                {labels.delivery}
              </button>
            )}
          </div>
        </Card>
        <Card title={labels.timeline}>
          <div className="workflow-timeline">
            {WORKFLOW_STEPS.map((stage, index) => (
              <div
                className={`workflow-timeline__item ${
                  index < currentIndex ? "is-complete" : ""
                } ${
                  index === currentIndex ? "is-active" : ""
                }`}
                key={stage.key}
              >
                <div className="workflow-timeline__dot">
                  {index < currentIndex
                    ? "✓"
                    : index + 1}
                </div>

                <div>
                  <h3>{t(stage.labelKey)}</h3>

                  <p>
                    {index < currentIndex
                      ? labels.completed
                      : index === currentIndex
                      ? labels.active
                      : labels.pending}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="workflow-note">
            {labels.payment}
          </div>

          <div
            className="workflow-note"
            style={{ marginTop: 12 }}
          >
            {labels.separation}
          </div>
        </Card>

      </div>
    </ScreenShell>
  );
}
export default function ApplicationDetails(){return <RequirePermission permissions={[PERMISSIONS.APPLICATION_VIEW_OWN,PERMISSIONS.VIEW_APPLICATIONS]} mode="any"><Content/></RequirePermission>;}

















