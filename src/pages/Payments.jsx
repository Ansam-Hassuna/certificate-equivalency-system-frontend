import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import {
  PAYMENT_STATUS,
  getPaymentState,
} from "../features/payments";
import "./Payments.css";

function Content() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [params] = useSearchParams();
  const applicationId = params.get("applicationId") || null;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);

    getPaymentState(applicationId)
      .then((data) => {
        if (!active) return;
        setPayment(data);
      })
      .catch(() => {
        if (!active) return;

        setMessage(
          ar
            ? "تعذر تحميل حالة الرسوم والدفع."
            : "Unable to load the payment status."
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

  const status = useMemo(() => {
    switch (payment?.status) {
      case PAYMENT_STATUS.RECEIPT_RECORDED:
        return ar ? "الإيصال مسجل" : "Receipt recorded";

      case PAYMENT_STATUS.CONFIRMED:
        return ar ? "الدفع مؤكد" : "Payment confirmed";

      case PAYMENT_STATUS.UNPAID:
      default:
        return ar ? "غير مدفوع" : "Unpaid";
    }
  }, [ar, payment?.status]);

  const isConfirmed =
    payment?.status === PAYMENT_STATUS.CONFIRMED;

  const isReceiptRecorded =
    payment?.status === PAYMENT_STATUS.RECEIPT_RECORDED;

  const labels = ar
    ? {
        title: "الرسوم والدفع",
        description:
          "عرض قيمة الرسوم وحالة الدفع اليدوي الخاصة بطلب المعادلة.",
        status: "حالة الدفع",
        fee: "قيمة الرسوم",
        receipt: "رقم إيصال الدفع",
        method: "طريقة الدفع",
        finance: "الدفع في الدائرة المالية",
        bank: "الدفع في الحساب البنكي المخصص للرسوم",
        manual:
          "يتم دفع الرسوم يدويًا عند تسليم الوثائق الورقية، ويقوم الموظف المختص بتسجيل الإيصال وتأكيد الدفع في النظام.",
        recorded:
          "تم تسجيل إيصال الدفع، والدفع بانتظار التأكيد من الموظف المختص.",
        confirmed:
          "تم تأكيد الدفع اليدوي ويمكن متابعة إجراءات تسليم واستلام الوثائق.",
        unpaid:
          "لم يتم تسجيل الدفع بعد.",
        loading:
          "جارٍ تحميل حالة الدفع...",
      }
    : {
        title: "Fees & Payment",
        description:
          "View the equivalency fee amount and the manual payment status for this application.",
        status: "Payment status",
        fee: "Fee amount",
        receipt: "Payment receipt number",
        method: "Payment method",
        finance: "Payment at the Finance Department",
        bank: "Payment to the dedicated fee bank account",
        manual:
          "Fees are paid manually when the paper documents are delivered. The responsible staff member records the receipt and confirms the payment in the system.",
        recorded:
          "The payment receipt has been recorded and is awaiting confirmation by the responsible staff member.",
        confirmed:
          "Manual payment has been confirmed. The document delivery and receipt process may continue.",
        unpaid:
          "Payment has not been recorded yet.",
        loading:
          "Loading payment status...",
      };

  return (
    <ScreenShell
      title={labels.title}
      description={labels.description}
      icon="payment"
      stats={[
        {
          label: labels.status,
          value: loading ? "—" : status,
        },
        {
          label: labels.fee,
          value:
            payment?.feeAmount !== undefined
              ? `${payment.feeAmount} ${payment?.currency || ""}`
              : "—",
        },
      ]}
    >
      <Card title={ar ? "معلومات الدفع" : "Payment information"}>
        {loading ? (
          <div className="workflow-note">
            {labels.loading}
          </div>
        ) : (
          <>
            <div className="payment-rule">
              <Icon
                name={isConfirmed ? "check" : "lock"}
                size={20}
              />

              <span>
                {isConfirmed
                  ? labels.confirmed
                  : isReceiptRecorded
                    ? labels.recorded
                    : labels.unpaid}
              </span>
            </div>

            <div className="payment-status-row">
              <strong>{labels.status}:</strong>

              <Badge
                tone={
                  isConfirmed
                    ? "success"
                    : "warning"
                }
              >
                {status}
              </Badge>
            </div>

            <div className="payment-fee-box">
              <span>{labels.fee}</span>

              <strong>
                {payment?.feeAmount !== undefined
                  ? `${payment.feeAmount} ${payment?.currency || ""}`
                  : "—"}
              </strong>
            </div>

            {payment?.method && (
              <div className="workflow-note">
                <strong>{labels.method}: </strong>
                {payment.method ===
                "FINANCE_DEPARTMENT"
                  ? labels.finance
                  : labels.bank}
              </div>
            )}

            {payment?.receiptNumber && (
              <div className="workflow-note">
                <strong>{labels.receipt}: </strong>
                {payment.receiptNumber}
              </div>
            )}

            <div className="payment-source-note">
              {labels.manual}
            </div>
          </>
        )}

        {message && (
          <div
            className="workflow-note"
            role="status"
          >
            {message}
          </div>
        )}
      </Card>
    </ScreenShell>
  );
}

export default function Payments() {
  return (
    <RequirePermission
      permission={PERMISSIONS.PAYMENT_VIEW_OWN}
    >
      <Content />
    </RequirePermission>
  );
}
