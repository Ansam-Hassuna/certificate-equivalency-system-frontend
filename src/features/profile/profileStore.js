const STORAGE_KEY = "ce_applicant_profiles";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(store)
  );
}

export function getApplicantProfile(userId) {
  if (!userId) {
    return null;
  }

  const store = readStore();

  return store[userId] || null;
}

export function saveApplicantProfile(
  userId,
  profile
) {
  if (!userId) {
    return null;
  }

  const store = readStore();

  const next = {
    ...(store[userId] || {}),
    ...(profile || {}),
    updatedAt:
      new Date().toISOString(),
  };

  store[userId] = next;

  saveStore(store);

  return next;
}

export function clearApplicantProfile(userId) {
  if (!userId) {
    return;
  }

  const store = readStore();

  delete store[userId];

  saveStore(store);
}

export function isApplicantProfileComplete(userId) {
  const profile = getApplicantProfile(userId);

  if (!profile) {
    return false;
  }

  const requiredFields = [
    "nationalId",
    "identityType",
    "fullName",
    "gender",
    "dateOfBirth",
    "nationality",
    "email",
    "backupEmail",
    "phone",
    "whatsappPrefix",
    "whatsapp",
    "country",
    "city",
    "address",
    "imageUrl",
  ];

  return requiredFields.every((key) =>
    String(profile[key] || "").trim()
  );
}
export default {
  getApplicantProfile,
  saveApplicantProfile,
  clearApplicantProfile,
  isApplicantProfileComplete,
};

