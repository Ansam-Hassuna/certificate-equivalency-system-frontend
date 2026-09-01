import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { PERMISSIONS } from "../auth/permissions";
import { RequirePermission } from "../auth/guards";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";
import { getPaymentState, isPaymentConfirmed } from "../features/payments";
import "./Payments.css";

function Content() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; getPaymentState(null).then((p) => active && setPayment(p)).catch(() => {}).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const confirmed = isPaymentConfirmed(payment);
  const labels = ar ? { title: "تسليم الوثائق", description: "متابعة تسليم الوثائق بعد استيفاء شروط المرحلة السابقة.", blocked: "التسليم محجوب حتى يتم تأكيد الدفع من الخادم.", ready: "الدفع مؤكد ويمكن متابعة إجراء التسليم.", status: confirmed ? "جاهز للتسليم" : "محجوب" } : { title: "Document Delivery", description: "Follow document delivery after the preceding requirements are satisfied.", blocked: "Delivery is blocked until payment is confirmed by the server.", ready: "Payment is confirmed and delivery may proceed.", status: confirmed ? "Ready for delivery" : "Blocked" };
  return <ScreenShell title={labels.title} description={labels.description} icon="check" stats={[{ label: ar ? "الحالة" : "Status", value: loading ? "—" : labels.status }]}><Card><div className="payment-rule"><Icon name={confirmed ? "check" : "lock"} size={22}/><span>{loading ? (ar ? "جارٍ التحقق من حالة الدفع..." : "Checking payment status...") : (confirmed ? labels.ready : labels.blocked)}</span></div><Badge tone={confirmed ? "success" : "warning"}>{labels.status}</Badge></Card></ScreenShell>;
}
export default function Delivery(){return <RequirePermission permission={PERMISSIONS.DELIVERY}><Content /></RequirePermission>}
