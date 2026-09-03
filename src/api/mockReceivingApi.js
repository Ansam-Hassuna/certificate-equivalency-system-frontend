const RECEIVING_STATUS = Object.freeze({
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
});

const STORAGE_KEY = "ce_mock_receiving_state";

const isBrowser =
  typeof window !== "undefined";

function readStore() {
  if (!isBrowser) return {};

  try {
    const value =
      window.sessionStorage.getItem(
        STORAGE_KEY
      );

    return value
      ? JSON.parse(value)
      : {};
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

function createDefaultReceiving(
  applicationId
) {
  return {
    applicationId:
      applicationId || null,

    status:
      RECEIVING_STATUS.PENDING,

    receivedBy: "",
    receivedAt: null,
    notes: "",
  };
}

function getKey(applicationId) {
  return (
    applicationId ||
    "__current__"
  );
}

function getOrCreateReceiving(
  applicationId
) {
  const store = readStore();
  const key = getKey(applicationId);

  if (!store[key]) {
    store[key] =
      createDefaultReceiving(
        applicationId
      );

    saveStore(store);
  }

  return store[key];
}

function updateReceiving(
  applicationId,
  receiving
) {
  const store = readStore();
  const key = getKey(applicationId);

  store[key] = receiving;

  saveStore(store);

  return receiving;
}

export const receivingApi = {
  async get(applicationId) {
    return {
      ...getOrCreateReceiving(
        applicationId
      ),
    };
  },

  async confirm(
    applicationId,
    {
      receivedBy,
      notes = "",
    }
  ) {
    const receiving =
      getOrCreateReceiving(
        applicationId
      );

    if (
      !String(
        receivedBy || ""
      ).trim()
    ) {
      const error = new Error(
        "Receiver name is required."
      );

      error.code =
        "INVALID_RECEIVING_DATA";

      error.status = 400;

      throw error;
    }

    if (
      receiving.status ===
      RECEIVING_STATUS.RECEIVED
    ) {
      const error = new Error(
        "This application has already been received."
      );

      error.code =
        "RECEIVING_ALREADY_COMPLETED";

      error.status = 409;

      throw error;
    }

    const next = {
      ...receiving,

      status:
        RECEIVING_STATUS.RECEIVED,

      receivedBy:
        String(
          receivedBy
        ).trim(),

      receivedAt:
        new Date().toISOString(),

      notes:
        String(
          notes || ""
        ).trim(),
    };

    return {
      ...updateReceiving(
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
  RECEIVING_STATUS,
};

export default receivingApi;
