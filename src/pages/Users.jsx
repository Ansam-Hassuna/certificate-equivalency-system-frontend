import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../auth/AuthContext";

import { PERMISSIONS } from "../auth/permissions";

import {
  ROLES,
  ROLE_LABELS,
  ROLE_PERMISSIONS
} from "../auth/roles";

import { RequirePermission } from "../auth/guards";
import { hasPermission } from "../auth/accessControl";

import ScreenShell from "./workflow/ScreenShell";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";


// ============================================================
// API
// ============================================================

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://localhost:5001";


// ============================================================
// Helpers
// ============================================================

// نجيب JWT من sessionStorage
function getAuthToken() {
  try {
    const session = JSON.parse(
      sessionStorage.getItem("ce_auth_session") || "null"
    );

    return session?.token || null;
  } catch {
    return null;
  }
}


// تحويل الأدوار القديمة إلى الأدوار الجديدة
function normalizeLegacyRole(role) {
  const value = String(role || "")
    .trim()
    .toUpperCase();

  // الدور القديم Member كان يمثل مقدم الطلب
  if (value === "MEMBER") {
    return ROLES.APPLICANT;
  }

  // Admin القديم
  if (value === "ADMIN") {
    return ROLES.ADMIN;
  }

  // إذا الدور أصلًا من الأدوار الجديدة
  if (Object.values(ROLES).includes(value)) {
    return value;
  }

  // أي Role قديم غير معروف
  return ROLES.APPLICANT;
}


// ============================================================
// Content
// ============================================================

function Content() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const ar = language === "ar";

  // ==========================================================
  // State
  // ==========================================================

  const [users, setUsers] = useState([]);

  const [
    selectedUserId,
    setSelectedUserId
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    message,
    setMessage
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const editSectionRef =
    useRef(null);


  // ==========================================================
  // Permissions
  // ==========================================================

  const canManageUsers =
    hasPermission(
      user,
      PERMISSIONS.MANAGE_USERS
    );


  // ==========================================================
  // Roles
  // ==========================================================

  const roleOptions =
    useMemo(() => {
      return Object.values(ROLES).map(
        (role) => ({
          value: role,

          label:
            ROLE_LABELS[role]?.[
              language
            ] || role
        })
      );
    }, [language]);


  const selectedUser =
    users.find(
      (item) =>
        item.id === selectedUserId
    );


  // ==========================================================
  // Load Users
  // ==========================================================

  const loadUsers =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const token =
          getAuthToken();

        const response =
          await fetch(
            `${API_BASE_URL}/api/Admin/users-with-roles`,
            {
              method: "GET",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json"
              }
            }
          );


        if (!response.ok) {
          const text =
            await response.text();

          throw new Error(
            text ||
            `Failed to load users: ${response.status}`
          );
        }


        const data =
          await response.json();


        // هنا أهم تعديل:
        // نحول Member القديم إلى APPLICANT
        const normalizedUsers =
          Array.isArray(data)
            ? data.map(
                (item) => ({
                  ...item,

                  role:
                    normalizeLegacyRole(
                      item.role ||
                      item.roles?.[0]
                    )
                })
              )
            : [];


        setUsers(
          normalizedUsers
        );

      } catch (err) {
        console.error(
          "Users API error:",
          err
        );

        setUsers([]);

        setError(
          ar
            ? "تعذر تحميل المستخدمين."
            : "Unable to load users."
        );

      } finally {
        setLoading(false);
      }
    }, [ar]);


  // ==========================================================
  // First Load
  // ==========================================================

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  // ==========================================================
  // Open User
  // ==========================================================

  const openUser =
    (item) => {
      setSelectedUserId(
        item.id
      );


      // نتأكد مرة ثانية إن الدور موحد
      setSelectedRole(
        normalizeLegacyRole(
          item.role ||
          item.roles?.[0]
        )
      );


      setMessage("");
      setError("");


      window.setTimeout(
        () => {
          editSectionRef
            .current
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start"
            });
        },
        0
      );
    };


  // ==========================================================
  // Update Role
  // ==========================================================

  const updateRole =
    async () => {
      if (
        !selectedUser ||
        saving
      ) {
        return;
      }


      // حماية حساب المدير الحالي
      if (
        selectedUser.id ===
        user?.id
      ) {
        setMessage(
          ar
            ? "لا يمكن تغيير دور حساب المدير الحالي من هذه الشاشة."
            : "The current administrator account cannot be changed from this screen."
        );

        return;
      }


      if (!selectedRole) {
        setMessage(
          ar
            ? "يرجى اختيار الدور."
            : "Please select a role."
        );

        return;
      }


      // نتأكد إن القيمة المرسلة للباك من النظام الجديد
      const roleToSend =
        normalizeLegacyRole(
          selectedRole
        );


      setSaving(true);
      setMessage("");
      setError("");


      try {
        const token =
          getAuthToken();


        const url =
          `${API_BASE_URL}` +
          `/api/Admin/edit-roles/` +
          `${encodeURIComponent(
            selectedUser.id
          )}` +
          `?roles=${encodeURIComponent(
            roleToSend
          )}`;


        const response =
          await fetch(
            url,
            {
              method: "POST",

              credentials:
                "include",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json"
              }
            }
          );


        if (!response.ok) {
          const responseText =
            await response.text();

          throw new Error(
            responseText ||
            `Failed to update role: ${response.status}`
          );
        }


        const updatedRoles =
          await response.json();


        const updatedRole =
          normalizeLegacyRole(
            updatedRoles?.[0] ||
            roleToSend
          );


        setSelectedRole(
          updatedRole
        );


        setMessage(
          ar
            ? "تم تحديث دور المستخدم بنجاح."
            : "The user role was updated successfully."
        );


        // نعيد تحميل المستخدمين من الداتابيس
        await loadUsers();

      } catch (err) {
        console.error(
          "Update role API error:",
          err
        );

        setError(
          ar
            ? "تعذر تحديث دور المستخدم."
            : "Unable to update user role."
        );

      } finally {
        setSaving(false);
      }
    };


  // ==========================================================
  // Stats
  // ==========================================================

  const stats = [
    {
      label:
        ar
          ? "إجمالي المستخدمين"
          : "Total users",

      value:
        users.length
    },

    {
      label:
        ar
          ? "مقدمو الطلبات"
          : "Applicants",

      value:
        users.filter(
          (item) =>
            item.role ===
            ROLES.APPLICANT
        ).length
    },

    {
      label:
        ar
          ? "الموظفون"
          : "Staff",

      value:
        users.filter(
          (item) =>
            item.role !==
            ROLES.APPLICANT
        ).length
    },

    {
      label:
        ar
          ? "الأدوار المتاحة"
          : "Available roles",

      value:
        Object.values(
          ROLES
        ).length
    }
  ];


  // ==========================================================
  // Table
  // ==========================================================

  const columns = [
    {
      key: "displayName",

      label:
        ar
          ? "المستخدم"
          : "User"
    },

    {
      key: "email",

      label:
        ar
          ? "البريد الإلكتروني"
          : "Email"
    },

    {
      key: "role",

      label:
        ar
          ? "الدور"
          : "Role"
    },

    {
      key: "actions",

      label:
        ar
          ? "الإجراء"
          : "Action"
    }
  ];


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <ScreenShell
      title={
        ar
          ? "إدارة المستخدمين"
          : "User Management"
      }

      description={
        ar
          ? "إدارة حسابات المستخدمين وتحديد أدوارهم وصلاحياتهم."
          : "Manage user accounts, roles, and permissions."
      }

      icon="users"

      stats={stats}
    >

      {/* معلومات */}

      <Card>
        <div className="workflow-note">

          <strong>
            {ar
              ? "صلاحيات المستخدم مرتبطة بالدور"
              : "Permissions are derived from the role"}
          </strong>

          <p>
            {ar
              ? "عند تغيير دور المستخدم تتغير الصلاحيات المرتبطة به حسب الدور الجديد."
              : "Changing the user role changes the permissions associated with that role."}
          </p>

        </div>
      </Card>


      {/* Error */}

      {error && (
        <Card>
          <div
            className="workflow-note"
            role="alert"
          >
            {error}
          </div>
        </Card>
      )}


      {/* Users Table */}

      <Card
        title={
          ar
            ? "قائمة المستخدمين"
            : "User List"
        }
      >

        <Table
          columns={columns}

          rows={users}

          loading={loading}

          emptyMessage={
            ar
              ? "لا يوجد مستخدمون"
              : "No users found"
          }

          renderCell={(
            row,
            column
          ) => {

            // الاسم
            if (
              column.key ===
              "displayName"
            ) {
              return (
                row.displayName ||
                "—"
              );
            }


            // الدور
            if (
              column.key ===
              "role"
            ) {
              return (
                <Badge tone="neutral">
                  {
                    ROLE_LABELS[
                      row.role
                    ]?.[
                      language
                    ] ||
                    row.role ||
                    "—"
                  }
                </Badge>
              );
            }


            // زر التعديل
            if (
              column.key ===
              "actions"
            ) {
              return (
                <Button
                  variant="ghost"
                  size="sm"

                  disabled={
                    !canManageUsers
                  }

                  onClick={() =>
                    openUser(row)
                  }
                >
                  {ar
                    ? "تعديل"
                    : "Manage"}
                </Button>
              );
            }


            return (
              row[
                column.key
              ] || "—"
            );
          }}
        />

      </Card>


      {/* تعديل المستخدم */}

      {selectedUser && (

        <div
          ref={
            editSectionRef
          }
        >

          <Card
            title={
              ar
                ? "تعديل المستخدم"
                : "Manage User"
            }
          >

            <div className="workflow-detail-grid">

              {/* الاسم */}

              <div>
                <span>
                  {ar
                    ? "المستخدم"
                    : "User"}
                </span>

                <strong>
                  {
                    selectedUser
                      .displayName ||
                    "—"
                  }
                </strong>
              </div>


              {/* البريد */}

              <div>
                <span>
                  {ar
                    ? "البريد الإلكتروني"
                    : "Email"}
                </span>

                <strong>
                  {
                    selectedUser
                      .email ||
                    "—"
                  }
                </strong>
              </div>


              {/* ID */}

              <div>
                <span>
                  {ar
                    ? "معرف المستخدم"
                    : "User ID"}
                </span>

                <strong>
                  {
                    selectedUser.id
                  }
                </strong>
              </div>


              {/* الدور */}

              <div>
                <span>
                  {ar
                    ? "الدور الحالي"
                    : "Current Role"}
                </span>

                <strong>
                  {
                    ROLE_LABELS[
                      selectedUser.role
                    ]?.[
                      language
                    ] ||
                    selectedUser.role ||
                    "—"
                  }
                </strong>
              </div>

            </div>


            {/* تغيير الدور */}

            {selectedUser.id !==
              user?.id && (

              <>

                <div
                  className="payment-form"

                  style={{
                    marginTop: 20
                  }}
                >

                  <Select
                    label={
                      ar
                        ? "الدور الوظيفي"
                        : "Role"
                    }

                    value={
                      selectedRole
                    }

                    onChange={
                      (event) =>
                        setSelectedRole(
                          event.target.value
                        )
                    }

                    options={
                      roleOptions
                    }

                    required
                  />


                  <Button
                    type="button"

                    onClick={
                      updateRole
                    }

                    disabled={
                      saving ||
                      !canManageUsers
                    }
                  >
                    {saving
                      ? (
                          ar
                            ? "جارٍ الحفظ..."
                            : "Saving..."
                        )
                      : (
                          ar
                            ? "حفظ الدور"
                            : "Save Role"
                        )}
                  </Button>

                </div>


                {/* صلاحيات الدور */}

                <div
                  className="workflow-note"

                  style={{
                    marginTop: 16
                  }}
                >

                  <strong>
                    {ar
                      ? "صلاحيات الدور المختار"
                      : "Selected role permissions"}
                  </strong>


                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 10
                    }}
                  >

                    {(
                      ROLE_PERMISSIONS[
                        selectedRole
                      ] || []
                    ).map(
                      (permission) => (

                        <Badge
                          key={
                            permission
                          }

                          tone="neutral"
                        >
                          {permission}
                        </Badge>

                      )
                    )}

                  </div>

                </div>

              </>
            )}


            {/* حساب الأدمن الحالي */}

            {selectedUser.id ===
              user?.id && (

              <div
                className="workflow-note"

                style={{
                  marginTop: 16
                }}
              >
                {ar
                  ? "حساب المدير الحالي محمي من تغيير دوره من هذه الشاشة."
                  : "The current administrator account is protected from role changes on this screen."}
              </div>

            )}

          </Card>

        </div>
      )}


      {/* Success */}

      {message && (
        <Card>

          <div
            className="workflow-note"
            role="status"
          >
            {message}
          </div>

        </Card>
      )}

    </ScreenShell>
  );
}


// ============================================================
// Page
// ============================================================

export default function Users() {
  return (
    <RequirePermission
      permission={
        PERMISSIONS.MANAGE_USERS
      }
    >
      <Content />
    </RequirePermission>
  );
}