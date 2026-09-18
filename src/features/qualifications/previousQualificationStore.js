const STORAGE_KEY = "certificate-equivalency-previous-qualifications";

export function getStoredPreviousQualifications(ownerUserId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) => item?.ownerUserId === ownerUserId
    );
  } catch {
    return [];
  }
}

export function saveStoredPreviousQualifications(
  ownerUserId,
  qualifications
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const safeExisting = Array.isArray(existing) ? existing : [];

    const withoutOwner = safeExisting.filter(
      (item) => item?.ownerUserId !== ownerUserId
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        ...withoutOwner,
        ...qualifications.map((item) => ({
          ...item,
          ownerUserId,
        })),
      ])
    );
  } catch {
    // Ignore localStorage errors in mock mode.
  }
}

export function addStoredPreviousQualification(
  ownerUserId,
  qualification
) {
  const current =
    getStoredPreviousQualifications(ownerUserId);

  saveStoredPreviousQualifications(ownerUserId, [
    ...current,
    {
      ...qualification,
      ownerUserId,
    },
  ]);
}

export function updateStoredPreviousQualification(
  ownerUserId,
  qualificationId,
  updates = {}
) {
  try {
    const current =
      getStoredPreviousQualifications(ownerUserId);

    const updated = current.map((item) =>
      item?.id === qualificationId
        ? {
            ...item,
            ...updates,
          }
        : item
    );

    saveStoredPreviousQualifications(
      ownerUserId,
      updated
    );

    return (
      updated.find(
        (item) =>
          item?.id === qualificationId
      ) || null
    );
  } catch {
    return null;
  }
}
export function clearStoredPreviousQualifications(
  ownerUserId
) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    const safeExisting = Array.isArray(parsed)
      ? parsed
      : [];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        safeExisting.filter(
          (item) => item?.ownerUserId !== ownerUserId
        )
      )
    );
  } catch {
    // Ignore localStorage errors in mock mode.
  }
}

export default {
  getStoredPreviousQualifications,
  saveStoredPreviousQualifications,
  addStoredPreviousQualification,
  clearStoredPreviousQualifications,
};

