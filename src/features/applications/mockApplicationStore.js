const STORAGE_KEY = "certificate-equivalency-applications";

export function getStoredApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredApplications(applications) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(applications)
  );
}

export function createMockApplication(application) {
  const current = getStoredApplications();

  const next = {
    ...application,
    createdAt:
      application.createdAt ||
      new Date().toISOString(),
  };

  saveStoredApplications([
    ...current.filter((item) => item.id !== next.id),
    next,
  ]);

  return next;
}

export function clearStoredApplications() {
  localStorage.removeItem(STORAGE_KEY);
}

export default {
  getStoredApplications,
  saveStoredApplications,
  createMockApplication,
  clearStoredApplications,
};
