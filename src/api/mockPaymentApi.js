const PAYMENT_STATUS = Object.freeze({
  UNPAID: "UNPAID",
  RECEIPT_RECORDED: "RECEIPT_RECORDED",
  CONFIRMED: "CONFIRMED",
});

const PAYMENT_METHODS = Object.freeze({
  FINANCE_DEPARTMENT: "FINANCE_DEPARTMENT",
  BANK_ACCOUNT: "BANK_ACCOUNT",
});

const STORAGE_KEY = "ce_mock_payment_state";

const isBrowser = typeof window !== "undefined";

function readStore() {
  if (!isBrowser) return {};

  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  if (!isBrowser) return;

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(store)
  );
}

function createDefaultPayment(applicationId) {
  return {
    applicationId: applicationId || null,
    feeAmount: 0,
    currency: "ILS",
    method: "",
    receiptNumber: "",
    receiptFileName: null,
    status: PAYMENT_STATUS.UNPAID,
  };
}

function getKey(applicationId) {
  return applicationId || "__current__";
}

function getOrCreatePayment(applicationId) {
  const store = readStore();
  const key = getKey(applicationId);

  if (!store[key]) {
    store[key] = createDefaultPayment(applicationId);
    saveStore(store);
  }

  return store[key];
}

function updatePayment(applicationId, payment) {
  const store = readStore();
  const key = getKey(applicationId);

  store[key] = payment;
  saveStore(store);

  return payment;
}

export const paymentApi = {
  async get(applicationId) {
    return {
      ...getOrCreatePayment(applicationId),
    };
  },

  async recordReceipt(
    applicationId,
    { method, receiptNumber, file }
  ) {
    const payment =
      getOrCreatePayment(applicationId);

    if (
      payment.status ===
      PAYMENT_STATUS.CONFIRMED
    ) {
      const error = new Error(
        "Confirmed payment cannot be recorded again."
      );

      error.code =
        "PAYMENT_ALREADY_CONFIRMED";
      error.status = 409;

      throw error;
    }

    if (
      !method ||
      !String(receiptNumber || "").trim()
    ) {
      const error = new Error(
        "Payment method and receipt number are required."
      );

      error.code = "INVALID_PAYMENT_DATA";
      error.status = 400;

      throw error;
    }

    const next = {
      ...payment,
      method,
      receiptNumber: String(
        receiptNumber
      ).trim(),
      receiptFileName:
        file?.name || null,
      status:
        PAYMENT_STATUS.RECEIPT_RECORDED,
    };

    return {
      ...updatePayment(
        applicationId,
        next
      ),
    };
  },

  async confirm(applicationId) {
    const payment =
      getOrCreatePayment(applicationId);

    if (
      payment.status !==
      PAYMENT_STATUS.RECEIPT_RECORDED
    ) {
      const error = new Error(
        "A recorded receipt is required before payment confirmation."
      );

      error.code =
        "PAYMENT_RECEIPT_REQUIRED";
      error.status = 400;

      throw error;
    }

    const next = {
      ...payment,
      status:
        PAYMENT_STATUS.CONFIRMED,
    };

    return {
      ...updatePayment(
        applicationId,
        next
      ),
    };
  },

  clear() {
    if (!isBrowser) return;

    window.sessionStorage.removeItem(
      STORAGE_KEY
    );
  },
};

export {
  PAYMENT_STATUS,
  PAYMENT_METHODS,
};

export default paymentApi;

