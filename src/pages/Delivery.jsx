import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import {
  getPaymentState,
  isPaymentConfirmed,
} from "../features/payments";
import "./Payments.css";

function Content() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get("applicationId");

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) {
      setPayment(null);
      setLoading(false);
      return;
    }

    let active = true;

    setLoading(true);

    getPaymentState(applicationId)
      .then((data) => {
        if (active) {
          setPayment(data);
        }
      })
      .catch(() => {
        if (active) {
          setPayment(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [applicationId]);

  const confirmed = isPaymentConfirmed(payment);

  if (!applicationId) {
    return (
      <ScreenShell
        title={ar ? "لم يتم تحديد طلب" : "No application selected"}
        description={
          ar
            ? "يجب فتح شاشة التسليم من طلب محدد."
            : "The delivery screen must be opened for a specific application."
        }
        icon="check"
      />
    );
  }

  const labels = ar
    ? {
        title: "تسليم الوثائق",
        description:
          "متابعة تسليم الوثائق بعد استيفاء شروط المرحلة السابقة.",
        blocked: "التسليم محجوب حتى يتم تأكيد الدفع.",
        ready:
          "الدفع مؤكد ويمكن متابعة إجراء التسليم.",
        status: confirmed ? "جاهز للتسليم" : "محجوب",
        loading: "جارٍ التحقق من حالة الدفع...",
        paymentConfirmed:
          "تم تأكيد الدفع لهذا الطلب.",
      }
    : {
        title: "Document Delivery",
        description:
          "Follow document delivery after the preceding requirements are satisfied.",
        blocked:
          "Delivery is blocked until payment is confirmed.",
        ready:
          "Payment is confirmed and delivery may proceed.",
        status: confirmed ? "Ready for delivery" : "Blocked",
        loading: "Checking payment status...",
        paymentConfirmed:
          "Payment has been confirmed for this application.",
      };

  return (
    <ScreenShell
      title={`${labels.title} - ${applicationId}`}
      description={labels.description}
      icon="check"
      stats={[
        {
          label: ar ? "الحالة" : "Status",
          value: loading ? "—" : labels.status,
        },
      ]}
    >
      <Card>
        <div className="payment-rule">
          <Icon
            name={confirmed ? "check" : "lock"}
            size={22}
          />

          <span>
            {loading
              ? labels.loading
              : confirmed
                ? labels.ready
                : labels.blocked}
          </span>
        </div>

        <Badge tone={confirmed ? "success" : "warning"}>
          {labels.status}
        </Badge>

        {confirmed && (
          <div
            className="workflow-note"
            role="status"
            style={{ marginTop: 12 }}
          >
            {labels.paymentConfirmed}
          </div>
        )}
      </Card>
    </ScreenShell>
  );
}

export default function Delivery() {
  return (
    <RequirePermission permission={PERMISSIONS.DELIVERY}>
      <Content />
    </RequirePermission>
  );
}
