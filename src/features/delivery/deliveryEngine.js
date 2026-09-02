import { deliveryApi } from "../../api/mockDeliveryApi";

export const DELIVERY_STATUS =
  Object.freeze({
    READY: "READY",
    DELIVERED: "DELIVERED",
  });

export function getDeliveryState(
  applicationId
) {
  return deliveryApi.get(
    applicationId
  );
}

export function confirmDelivery(
  applicationId,
  deliveredTo
) {
  return deliveryApi.confirm(
    applicationId,
    deliveredTo
  );
}

export function isDeliveryCompleted(
  delivery
) {
  return (
    delivery?.status ===
    DELIVERY_STATUS.DELIVERED
  );
}
