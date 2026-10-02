const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://localhost:5001";

const QUALIFICATION_TYPE_MAP = {
  secondary: 1,
  diploma: 2,
  bachelor: 3,
  master: 4,
  doctorate: 5,
  medium_diploma: 6,
  higher_diploma: 7,
};

function getAuthToken() {
  try {
    const session = JSON.parse(
      sessionStorage.getItem("ce_auth_session") ||
        "null"
    );

    return session?.token || null;
  } catch {
    return null;
  }
}

async function readError(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (
    contentType.includes("application/json")
  ) {
    try {
      const data = await response.json();

      return (
        data?.message ||
        data?.title ||
        data?.detail ||
        JSON.stringify(data)
      );
    } catch {
      // نكمل ونحاول نقرأ النص
    }
  }

  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function request(
  path,
  options = {}
) {
  const token = getAuthToken();

  const isFormData =
    options.body instanceof FormData;

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,

      credentials: "include",

      headers: {
        ...(!isFormData
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        Accept: "application/json",

        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const message =
      await readError(response);

    throw new Error(
      message ||
        `Request failed: ${response.status}`
    );
  }

  if (
    response.status === 204 ||
    response.headers.get(
      "content-length"
    ) === "0"
  ) {
    return null;
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json();
  }

  return response.text();
}


// ============================================================
// STEP 1
// إنشاء الطلب كمسودة
// ============================================================

export function createApplicationDraft(
  qualificationType
) {
  const qualificationTypeId =
    QUALIFICATION_TYPE_MAP[
      String(qualificationType || "")
        .trim()
        .toLowerCase()
    ];

  if (!qualificationTypeId) {
    throw new Error(
      "Unsupported qualification type."
    );
  }

  return request(
    "/api/EquivalencyApplications",
    {
      method: "POST",

      body: JSON.stringify({
        qualificationType:
          qualificationTypeId,
      }),
    }
  );
}


// ============================================================
// STEP 2
// بيانات مقدم الطلب
// ============================================================

export function completeApplicationStep2(
  applicationId
) {
  return request(
    `/api/EquivalencyApplications/${applicationId}/step2`,
    {
      method: "PUT",
    }
  );
}


// ============================================================
// STEP 3
// بيانات الشهادة
// ============================================================

export function completeApplicationStep3(
  applicationId,
  data
) {
  return request(
    `/api/EquivalencyApplications/${applicationId}/step3`,
    {
      method: "PUT",

      body: JSON.stringify(data),
    }
  );
}


// ============================================================
// STEP 4
// جلب الوثائق المطلوبة
// ============================================================

export function getRequiredDocuments(
  applicationId
) {
  return request(
    `/api/EquivalencyApplications/${applicationId}/step4/documents`
  );
}


// ============================================================
// STEP 4
// رفع وثيقة
// ============================================================

export function uploadApplicationDocument(
  applicationId,
  documentType,
  file
) {
  const formData =
    new FormData();

  formData.append(
    "documentType",
    String(documentType)
  );

  formData.append(
    "file",
    file
  );

  return request(
    `/api/EquivalencyApplications/${applicationId}/step4/documents`,
    {
      method: "POST",
      body: formData,
    }
  );
}


// ============================================================
// STEP 4
// إنهاء خطوة الوثائق
// ============================================================

export function completeApplicationStep4(
  applicationId
) {
  return request(
    `/api/EquivalencyApplications/${applicationId}/step4`,
    {
      method: "PUT",
    }
  );
}


// ============================================================
// STEP 5
// مراجعة الطلب
// ============================================================

export function getApplicationReview(
  applicationId
) {
  return request(
    `/api/EquivalencyApplications/${applicationId}/review`
  );
}


// ============================================================
// STEP 6
// تقديم الطلب نهائيًا
// ============================================================

export function submitApplication(
  applicationId
) {
  return request(
    `/api/EquivalencyApplications/${applicationId}/submit`,
    {
      method: "PUT",
    }
  );
}


// ============================================================
// الدول
// ============================================================

export function getCountries() {
  return request(
    "/api/InstitutionData/countries"
  );
}


// ============================================================
// المؤسسات حسب الدولة ونوع المؤهل
// secondary => مدارس
// غير ذلك => جامعات / تعليم عالٍ
// ============================================================

export function getInstitutions(
  countryId,
  qualificationType
) {
  return request(
    `/api/InstitutionData/institutions?countryId=${encodeURIComponent(
      countryId
    )}&qualificationType=${encodeURIComponent(
      qualificationType
    )}`
  );
}


// ============================================================
// التخصصات / فروع الثانوية
// ============================================================

export function getMajors(
  institutionId,
  qualificationType
) {
  return request(
    `/api/InstitutionData/majors?institutionId=${encodeURIComponent(
      institutionId
    )}&qualificationType=${encodeURIComponent(
      qualificationType
    )}`
  );
}