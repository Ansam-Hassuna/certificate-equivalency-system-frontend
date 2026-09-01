import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";
import { hasPermission } from "../auth/accessControl";
import { RequirePermission } from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  getPaymentState,
  isPaymentConfirmed,
  confirmPayment,
  recordPaymentReceipt,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
} from "../features/payments";
import "./Payments.css";

function Content() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const ar = language === "ar";

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [method, setMethod] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  const canRecordPayment = hasPermission(
    user,
    PERMISSIONS.PAYMENT_RECORD
  );

  const canConfirmPayment = hasPermission(
    user,
    PERMISSIONS.PAYMENT_CONFIRM
  );

  useEffect(() => {
    let active = true;

    setLoading(true);

    getPaymentState(null)
      .then((data) => {
        if (!active) return;

        setPayment(data);
        setMethod(data?.method || "");
        setReceiptNumber(data?.receiptNumber || "");
      })
      .catch(() => {
        if (active) {
          setMessage(
            ar
              ? "تعذر تحميل حالة الدفع."
              : "Unable to load payment status."
          );
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
  }, [ar]);

  const confirmed = isPaymentConfirmed(payment);

  const receiptRecorded =
    payment?.status === PAYMENT_STATUS.RECEIPT_RECORDED;

  const recordReceipt = async (event) => {
    event.preventDefault();

    if (!canRecordPayment) {
      setMessage(
        ar
          ? "ليس لديك صلاحية تسجيل الدفع."
          : "You are not authorized to record payment."
      );
      return;
    }

    if (!method || !receiptNumber.trim()) {
      setMessage(
        ar
          ? "يرجى اختيار طريقة الدفع وإدخال رقم الإيصال."
          : "Select the payment method and enter the receipt number."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const next = await recordPaymentReceipt(null, {
        method,
        receiptNumber,
        file: receiptFile,
      });

      setPayment(next);

      setMessage(
        ar
          ? "تم تسجيل إيصال الدفع اليدوي بنجاح."
          : "Manual payment receipt recorded successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          (ar
            ? "تعذر تسجيل إيصال الدفع."
            : "Unable to record the payment receipt.")
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmManualPayment = async () => {
    if (!canConfirmPayment) {
      setMessage(
        ar
          ? "ليس لديك صلاحية تأكيد الدفع."
          : "You are not authorized to confirm payment."
      );
      return;
    }

    if (!receiptRecorded) {
      setMessage(
        ar
          ? "يجب تسجيل الإيصال أولًا."
          : "The payment receipt must be recorded first."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const next = await confirmPayment(null);

      setPayment(next);

      setMessage(
        ar
          ? "تم تأكيد الدفع اليدوي بنجاح."
          : "Manual payment confirmed successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          (ar
            ? "تعذر تأكيد الدفع."
            : "Unable to confirm payment.")
      );
    } finally {
      setSaving(false);
    }
  };

  const labels = ar
    ? {
        title: "استلام الوثائق الورقية",
        description:
          "تسجيل استلام الوثائق الورقية مع تسجيل وتأكيد الدفع اليدوي.",
        status: confirmed
          ? "مسموح بالاستلام"
          : receiptRecorded
            ? "الإيصال مسجل"
            : "الدفع غير مسجل",
        blocked:
          "لا يمكن متابعة استلام الوثائق قبل تسجيل الإيصال وتأكيد الدفع اليدوي.",
        receipt:
          "تم تسجيل الإيصال وبانتظار تأكيد الدفع.",
        allowed:
          "تم تأكيد الدفع ويمكن متابعة إجراء استلام الوثائق.",
        method: "طريقة الدفع",
        finance:
          "الدفع في الدائرة المالية",
        bank:
          "الدفع في الحساب البنكي المخصص",
        choose:
          "اختر طريقة الدفع",
        receiptNumber:
          "رقم إيصال الدفع",
        receiptFile:
          "نسخة من إيصال الدفع",
        record:
          "تسجيل إيصال الدفع",
        recording:
          "جارٍ تسجيل الإيصال...",
        confirm:
          "تأكيد الدفع اليدوي",
        confirming:
          "جارٍ تأكيد الدفع...",
        unauthorizedRecord:
          "لا تملك صلاحية تسجيل الدفع.",
        unauthorizedConfirm:
          "تم تسجيل الإيصال وبانتظار تأكيد الموظف المخول.",
      }
    : {
        title: "Paper Document Receipt",
        description:
          "Record paper-document receipt together with manual payment recording and confirmation.",
        status: confirmed
          ? "Receipt allowed"
          : receiptRecorded
            ? "Receipt recorded"
            : "Payment not recorded",
        blocked:
          "Paper-document receipt cannot proceed until the receipt is recorded and manual payment is confirmed.",
        receipt:
          "The payment receipt has been recorded and is awaiting payment confirmation.",
        allowed:
          "Payment is confirmed and paper-document receipt may proceed.",
        method:
          "Payment method",
        finance:
          "Payment at the Finance Department",
        bank:
          "Payment to the dedicated bank account",
        choose:
          "Choose a payment method",
        receiptNumber:
          "Payment receipt number",
        receiptFile:
          "Payment receipt copy",
        record:
          "Record payment receipt",
        recording:
          "Recording receipt...",
        confirm:
          "Confirm Manual Payment",
        confirming:
          "Confirming payment...",
        unauthorizedRecord:
          "You are not authorized to record payment.",
        unauthorizedConfirm:
          "The receipt is recorded and is awaiting confirmation by an authorized staff member.",
      };

  return (
    <ScreenShell
      title={labels.title}
      description={labels.description}
      icon="archive"
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
              ? ar
                ? "جارٍ التحقق من حالة الدفع..."
                : "Checking payment status..."
              : confirmed
                ? labels.allowed
                : receiptRecorded
                  ? labels.receipt
                  : labels.blocked}
          </span>
        </div>

        <Badge tone={confirmed ? "success" : "warning"}>
          {labels.status}
        </Badge>

        {!receiptRecorded && !confirmed && canRecordPayment && (
          <form
            className="payment-form"
            onSubmit={recordReceipt}
          >
            <Select
              label={labels.method}
              value={method}
              onChange={(event) =>
                setMethod(event.target.value)
              }
              placeholder={labels.choose}
              options={[
                {
                  value:
                    PAYMENT_METHODS.FINANCE_DEPARTMENT,
                  label: labels.finance,
                },
                {
                  value:
                    PAYMENT_METHODS.BANK_ACCOUNT,
                  label: labels.bank,
                },
              ]}
              required
            />

            <Input
              label={labels.receiptNumber}
              value={receiptNumber}
              onChange={(event) =>
                setReceiptNumber(event.target.value)
              }
              required
            />

            <div className="ui-field">
              <label
                className="ui-label"
                htmlFor="receiving-payment-receipt"
              >
                {labels.receiptFile}
              </label>

              <input
                id="receiving-payment-receipt"
                type="file"
                accept="application/pdf,image/*"
                onChange={(event) =>
                  setReceiptFile(
                    event.target.files?.[0] || null
                  )
                }
              />
            </div>

            <Button
              type="submit"
              disabled={saving || loading}
              icon={
                <Icon
                  name="check"
                  size={17}
                />
              }
            >
              {saving
                ? labels.recording
                : labels.record}
            </Button>
          </form>
        )}

        {!receiptRecorded && !confirmed && !canRecordPayment && (
          <div
            className="workflow-note"
            role="status"
          >
            {labels.unauthorizedRecord}
          </div>
        )}

        {receiptRecorded && !confirmed && (
          <div className="payment-confirm-box">
            <p>{labels.receipt}</p>

            {canConfirmPayment ? (
              <Button
                type="button"
                onClick={confirmManualPayment}
                disabled={saving || loading}
                icon={
                  <Icon
                    name="check"
                    size={17}
                  />
                }
              >
                {saving
                  ? labels.confirming
                  : labels.confirm}
              </Button>
            ) : (
              <div
                className="workflow-note"
                role="status"
              >
                {labels.unauthorizedConfirm}
              </div>
            )}
          </div>
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

export default function Receiving() {
  return (
    <RequirePermission
      permission={PERMISSIONS.RECEIVE_PAPER}
    >
      <Content />
    </RequirePermission>
  );
}
