import { receivingApi } from "../../api/mockReceivingApi";

export const RECEIVING_STATUS =
  Object.freeze({
    PENDING: "PENDING",
    RECEIVED: "RECEIVED",
  });

export function getReceivingState(
  applicationId
) {
  return receivingApi.get(
    applicationId
  );
}

export function confirmReceiving(
  applicationId,
  receivedBy,
  notes = ""
) {
  return receivingApi.confirm(
    applicationId,
    {
      receivedBy,
      notes,
    }
  );
}

export function isReceivingCompleted(
  receiving
) {
  return (
    receiving?.status ===
    RECEIVING_STATUS.RECEIVED
  );
}
