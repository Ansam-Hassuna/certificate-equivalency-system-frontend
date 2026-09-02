const DELIVERY_STATUS = Object.freeze({
  READY: "READY",
  DELIVERED: "DELIVERED",
});

const STORAGE_KEY = "ce_mock_delivery_state";

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

function createDefaultDelivery(
  applicationId
) {
  return {
    applicationId:
      applicationId || null,

    status:
      DELIVERY_STATUS.READY,

    deliveredTo: "",
    deliveredAt: null,
  };
}

function getKey(applicationId) {
  return (
    applicationId ||
    "__current__"
  );
}

function getOrCreateDelivery(
  applicationId
) {
  const store = readStore();
  const key = getKey(applicationId);

  if (!store[key]) {
    store[key] =
      createDefaultDelivery(
        applicationId
      );

    saveStore(store);
  }

  return store[key];
}

function updateDelivery(
  applicationId,
  delivery
) {
  const store = readStore();
  const key = getKey(applicationId);

  store[key] = delivery;

  saveStore(store);

  return delivery;
}

export const deliveryApi = {
  async get(applicationId) {
    return {
      ...getOrCreateDelivery(
        applicationId
      ),
    };
  },

  async confirm(
    applicationId,
    deliveredTo
  ) {
    const delivery =
      getOrCreateDelivery(
        applicationId
      );

    if (
      !String(
        deliveredTo || ""
      ).trim()
    ) {
      const error = new Error(
        "Recipient name is required."
      );

      error.code =
        "INVALID_DELIVERY_DATA";

      error.status = 400;

      throw error;
    }

    if (
      delivery.status ===
      DELIVERY_STATUS.DELIVERED
    ) {
      const error = new Error(
        "This application has already been delivered."
      );

      error.code =
        "DELIVERY_ALREADY_COMPLETED";

      error.status = 409;

      throw error;
    }

    const next = {
      ...delivery,

      status:
        DELIVERY_STATUS.DELIVERED,

      deliveredTo:
        String(
          deliveredTo
        ).trim(),

      deliveredAt:
        new Date().toISOString(),
    };

    return {
      ...updateDelivery(
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
  DELIVERY_STATUS,
};

export default deliveryApi;
