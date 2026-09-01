import { paymentApi } from "../../api/mockPaymentApi";

export const PAYMENT_STATUS = Object.freeze({
  UNPAID: "UNPAID",
  RECEIPT_RECORDED: "RECEIPT_RECORDED",
  CONFIRMED: "CONFIRMED",
});

export const PAYMENT_METHODS = Object.freeze({
  FINANCE_DEPARTMENT: "FINANCE_DEPARTMENT",
  BANK_ACCOUNT: "BANK_ACCOUNT",
});

export function getPaymentState(applicationId) {
  return paymentApi.get(applicationId);
}

export function recordPaymentReceipt(applicationId, { method, receiptNumber, file }) {
  return paymentApi.recordReceipt(applicationId, {
    method,
    receiptNumber: receiptNumber.trim(),
    file,
  });
}

export function confirmPayment(applicationId) {
  return paymentApi.confirm(applicationId);
}

export function isPaymentConfirmed(payment) {
  return payment?.status === PAYMENT_STATUS.CONFIRMED;
}

