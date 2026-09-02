import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Icon from "../components/ui/Icon";
import {
  getPaymentState,
  isPaymentConfirmed,
} from "../features/payments";
import {
  getDeliveryState,
  confirmDelivery,
  isDeliveryCompleted,
} from "../features/delivery";
import { getLocalizedRequestRows } from "./workflow/data";
import "./Payments.css";

function Content() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const applicationId =
    searchParams.get("applicationId");

  const [payment, setPayment] =
    useState(null);

  const [delivery, setDelivery] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [recipientName, setRecipientName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!applicationId) {
      setPayment(null);
      setDelivery(null);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);
    setError("");

    Promise.all([
      getPaymentState(applicationId),
      getDeliveryState(applicationId),
    ])
      .then(([paymentData, deliveryData]) => {
        if (!active) return;

        setPayment(paymentData);
        setDelivery(deliveryData);
      })
      .catch(() => {
        if (!active) return;

        setPayment(null);
        setDelivery(null);
        setError(
          ar
            ? "تعذر تحميل حالة التسليم."
            : "Unable to load delivery status."
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applicationId, ar]);

  const confirmed =
    isPaymentConfirmed(payment);

  const delivered =
    isDeliveryCompleted(delivery);

  if (!applicationId) {
    const requests =
      getLocalizedRequestRows(
        language
      ).filter(
        (row) => !row.archived
      );

    return (
      <ScreenShell
        title={
          ar
            ? "طلبات التسليم"
            : "Delivery Requests"
        }
        description={
          ar
            ? "اختر طلبًا لعرض حالة الدفع ومتابعة إجراء التسليم."
            : "Select an application to check payment and continue delivery."
        }
        icon="check"
      >
        <div className="workflow-list">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="workflow-list-item"
            >
              <div>
                <strong>{request.id}</strong>

                <span>
                  {request.applicant} ·{" "}
                  {request.qualification}
                </span>

                <Badge tone="neutral">
                  {request.status}
                </Badge>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/delivery?applicationId=${encodeURIComponent(
                        request.id
                      )}`
                    )
                  }
                >
                  {ar ? "عرض" : "Open"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScreenShell>
    );
  }

  const labels = ar
    ? {
        title: "تسليم الوثائق",
        description:
          "متابعة وتسـجيل تسليم الوثائق بعد استيفاء شروط المرحلة السابقة.",
        blocked:
          "التسليم محجوب حتى يتم تأكيد الدفع.",
        ready:
          "الدفع مؤكد ويمكن متابعة إجراء التسليم.",
        delivered:
          "تم تسجيل تسليم الوثائق لهذا الطلب.",
        status: delivered
          ? "تم التسليم"
          : confirmed
            ? "جاهز للتسليم"
            : "محجوب",
        loading:
          "جارٍ التحقق من حالة الدفع والتسليم...",
        paymentConfirmed:
          "تم تأكيد الدفع لهذا الطلب.",
        recipient:
          "اسم المستلم",
        recipientPlaceholder:
          "أدخل اسم الشخص الذي استلم الوثائق",
        record:
          "تسجيل التسليم",
        back:
          "العودة إلى طلبات التسليم",
      }
    : {
        title: "Document Delivery",
        description:
          "Track and record document delivery after the preceding requirements are satisfied.",
        blocked:
          "Delivery is blocked until payment is confirmed.",
        ready:
          "Payment is confirmed and delivery may proceed.",
        delivered:
          "Document delivery has been recorded for this application.",
        status: delivered
          ? "Delivered"
          : confirmed
            ? "Ready for delivery"
            : "Blocked",
        loading:
          "Checking payment and delivery status...",
        paymentConfirmed:
          "Payment has been confirmed for this application.",
        recipient:
          "Recipient name",
        recipientPlaceholder:
          "Enter the name of the person who received the documents",
        record:
          "Record delivery",
        back:
          "Back to delivery requests",
      };

  const handleConfirmDelivery =
    async (event) => {
      event.preventDefault();

      if (!confirmed || delivered) {
        return;
      }

      if (!recipientName.trim()) {
        setError(
          ar
            ? "يرجى إدخال اسم المستلم."
            : "Please enter the recipient name."
        );
        return;
      }

      setSubmitting(true);
      setError("");

      try {
        const result =
          await confirmDelivery(
            applicationId,
            recipientName
          );

        setDelivery(result);
      } catch (deliveryError) {
        setError(
          deliveryError?.message ||
            (ar
              ? "تعذر تسجيل التسليم."
              : "Unable to record delivery.")
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <ScreenShell
      title={`${labels.title} - ${applicationId}`}
      description={labels.description}
      icon="check"
      stats={[
        {
          label:
            ar
              ? "الحالة"
              : "Status",
          value:
            loading
              ? "—"
              : labels.status,
        },
      ]}
    >
      <Card>
        <div className="payment-rule">
          <Icon
            name={
              delivered
                ? "check"
                : confirmed
                  ? "check"
                  : "lock"
            }
            size={22}
          />

          <span>
            {loading
              ? labels.loading
              : delivered
                ? labels.delivered
                : confirmed
                  ? labels.ready
                  : labels.blocked}
          </span>
        </div>

        <Badge
          tone={
            delivered
              ? "success"
              : confirmed
                ? "success"
                : "warning"
          }
        >
          {labels.status}
        </Badge>

        {error && (
          <div
            className="workflow-note"
            role="alert"
            style={{ marginTop: 12 }}
          >
            {error}
          </div>
        )}

        {confirmed && !delivered && !loading && (
          <form
            onSubmit={
              handleConfirmDelivery
            }
            style={{
              marginTop: 18,
              display: "grid",
              gap: 14,
            }}
          >
            <Input
              label={labels.recipient}
              placeholder={
                labels.recipientPlaceholder
              }
              value={recipientName}
              onChange={(event) =>
                setRecipientName(
                  event.target.value
                )
              }
              required
            />

            <Button
              type="submit"
              disabled={submitting}
              icon={
                <Icon
                  name="check"
                  size={17}
                />
              }
            >
              {submitting
                ? ar
                  ? "جارٍ التسجيل..."
                  : "Recording..."
                : labels.record}
            </Button>
          </form>
        )}

        {delivered && (
          <div
            className="workflow-note"
            role="status"
            style={{ marginTop: 12 }}
          >
            {ar
              ? `تم التسليم إلى: ${delivery?.deliveredTo || "—"}`
              : `Delivered to: ${delivery?.deliveredTo || "—"}`}
          </div>
        )}

        <div
          style={{
            marginTop: 16,
          }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              navigate("/delivery")
            }
          >
            {labels.back}
          </Button>
        </div>
      </Card>
    </ScreenShell>
  );
}

export default function Delivery() {
  return (
    <RequirePermission
      permission={
        PERMISSIONS.DELIVERY
      }
    >
      <Content />
    </RequirePermission>
  );
}
