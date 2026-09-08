const STORAGE_KEY = "certificate-equivalency-workflow-state";

const EMPTY_STATE = {
  stage: "SUBMITTED",
  inquiry: null,
  inquiries: [],
  activeInquiryId: null,
  committee: null,
  draft: null,
  finalization: null,
  archive: null,
  delivery: null,
};

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

function normalizeWorkflowState(state) {
  const normalized = {
    ...EMPTY_STATE,
    ...(state || {}),
  };

  let inquiries = Array.isArray(normalized.inquiries)
    ? normalized.inquiries
    : [];

  if (
    normalized.inquiry &&
    !inquiries.some(
      (item) => item.id === normalized.inquiry.id
    )
  ) {
    inquiries = [
      ...inquiries,
      normalized.inquiry,
    ];
  }

  const activeInquiryId =
    normalized.activeInquiryId ||
    normalized.inquiry?.id ||
    inquiries.at(-1)?.id ||
    null;

  const activeInquiry =
    inquiries.find(
      (item) => item.id === activeInquiryId
    ) ||
    normalized.inquiry ||
    null;

  return {
    ...normalized,
    inquiries,
    activeInquiryId,
    inquiry: activeInquiry,
  };
}

export function getWorkflowState(applicationId) {
  if (!applicationId) {
    return normalizeWorkflowState(
      EMPTY_STATE
    );
  }

  const store = readStore();

  return normalizeWorkflowState(
    store[applicationId]
  );
}

export function updateWorkflowState(
  applicationId,
  patch = {}
) {
  if (!applicationId) {
    return getWorkflowState(applicationId);
  }

  const store = readStore();

  const current =
    getWorkflowState(applicationId);

  const next =
    normalizeWorkflowState({
      ...current,
      ...patch,
    });

  store[applicationId] = next;

  saveStore(store);

  return next;
}

export function setWorkflowStage(
  applicationId,
  stage
) {
  return updateWorkflowState(
    applicationId,
    { stage }
  );
}

export function setInquiryState(
  applicationId,
  inquiry
) {
  if (!inquiry) {
    return updateWorkflowState(
      applicationId,
      {
        inquiry: null,
        activeInquiryId: null,
      }
    );
  }

  return updateWorkflowState(
    applicationId,
    {
      inquiry,
      inquiries: [inquiry],
      activeInquiryId: inquiry.id || null,
    }
  );
}

export function setInquiries(
  applicationId,
  inquiries,
  activeInquiryId = null
) {
  const list = Array.isArray(inquiries)
    ? inquiries
    : [];

  const activeId =
    activeInquiryId ||
    list.at(-1)?.id ||
    null;

  const active =
    list.find(
      (item) => item.id === activeId
    ) || null;

  return updateWorkflowState(
    applicationId,
    {
      inquiries: list,
      activeInquiryId: activeId,
      inquiry: active,
    }
  );
}

export function addInquiry(
  applicationId,
  inquiry
) {
  if (!applicationId || !inquiry) {
    return getWorkflowState(
      applicationId
    );
  }

  const current =
    getWorkflowState(applicationId);

  const existing =
    current.inquiries || [];

  const nextInquiries = [
    ...existing.filter(
      (item) => item.id !== inquiry.id
    ),
    inquiry,
  ];

  return updateWorkflowState(
    applicationId,
    {
      stage:
        "CREDENTIAL_INQUIRY",
      inquiries: nextInquiries,
      activeInquiryId:
        inquiry.id || null,
      inquiry,
      lastAction:
        "CREDENTIAL_INQUIRY_CREATED",
      lastActionAt:
        new Date().toISOString(),
    }
  );
}

export function updateInquiry(
  applicationId,
  inquiryIdOrPatch,
  maybePatch
) {
  const current =
    getWorkflowState(applicationId);

  const list = [
    ...(current.inquiries || []),
  ];

  let inquiryId = current.activeInquiryId;
  let patch = inquiryIdOrPatch;

  if (
    typeof inquiryIdOrPatch === "string"
  ) {
    inquiryId = inquiryIdOrPatch;
    patch = maybePatch || {};
  }

  if (!inquiryId && current.inquiry?.id) {
    inquiryId = current.inquiry.id;
  }

  if (!inquiryId) {
    return current;
  }

  const index = list.findIndex(
    (item) => item.id === inquiryId
  );

  if (index === -1) {
    return current;
  }

  const updated = {
    ...list[index],
    ...(patch || {}),
  };

  list[index] = updated;

  return updateWorkflowState(
    applicationId,
    {
      inquiries: list,
      activeInquiryId: inquiryId,
      inquiry: updated,
    }
  );
}

export function getStoredInquiry(
  applicationId
) {
  return getWorkflowState(
    applicationId
  ).inquiry;
}

export function getStoredInquiries(
  applicationId
) {
  return getWorkflowState(
    applicationId
  ).inquiries;
}

export function clearInquiry(
  applicationId
) {
  return updateWorkflowState(
    applicationId,
    {
      inquiry: null,
      activeInquiryId: null,
    }
  );
}

export function setCommitteeState(
  applicationId,
  committee
) {
  return updateWorkflowState(
    applicationId,
    { committee }
  );
}

export function setDraftState(
  applicationId,
  draft
) {
  return updateWorkflowState(
    applicationId,
    { draft }
  );
}

export function setFinalizationState(
  applicationId,
  finalization
) {
  return updateWorkflowState(
    applicationId,
    { finalization }
  );
}

export function setDeliveryWorkflowState(
  applicationId,
  delivery
) {
  return updateWorkflowState(
    applicationId,
    { delivery }
  );
}

export function setArchiveState(
  applicationId,
  archive
) {
  return updateWorkflowState(
    applicationId,
    { archive }
  );
}

export function clearWorkflowState(
  applicationId
) {
  if (!applicationId) {
    return;
  }

  const store = readStore();

  delete store[applicationId];

  saveStore(store);
}

export function clearAllWorkflowState() {
  localStorage.removeItem(
    STORAGE_KEY
  );
}

export default {
  getWorkflowState,
  updateWorkflowState,
  setWorkflowStage,
  setInquiryState,
  setInquiries,
  addInquiry,
  updateInquiry,
  getStoredInquiry,
  getStoredInquiries,
  clearInquiry,
  setCommitteeState,
  setDraftState,
  setFinalizationState,
  setDeliveryWorkflowState,
  setArchiveState,
  clearWorkflowState,
  clearAllWorkflowState,
};
