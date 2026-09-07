import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../auth/permissions";
import {
  ROLES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "../auth/roles";
import { RequirePermission } from "../auth/guards";
import { hasPermission } from "../auth/accessControl";
import ScreenShell from "./workflow/ScreenShell";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import { authApi } from "../api/mockAuthApi";

function Content() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const ar = language === "ar";

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] =
    useState("");
  const [selectedRole, setSelectedRole] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const editSectionRef = useRef(null);

  const canManageUsers = hasPermission(
    user,
    PERMISSIONS.MANAGE_USERS
  );

  const roleOptions = useMemo(
    () =>
      Object.values(ROLES).map((role) => ({
        value: role,
        label:
          ROLE_LABELS[role]?.[language] ||
          role,
      })),
    [language]
  );

  const selectedUser = users.find(
    (item) => item.id === selectedUserId
  );

  const loadUsers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await authApi.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        error?.message ||
          (ar
            ? "تعذر تحميل المستخدمين."
            : "Unable to load users.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openUser = (item) => {
    setSelectedUserId(item.id);
    setSelectedRole(item.role);
    setMessage("");

    window.setTimeout(() => {
      editSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const updateRole = async () => {
    if (!selectedUser || saving) return;

    if (selectedUser.id === user?.id) {
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
          : "Select a role."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await authApi.updateUserRole(
        selectedUser.id,
        selectedRole
      );

      setMessage(
        ar
          ? "تم تحديث دور المستخدم وتطبيق الصلاحيات المرتبطة به."
          : "The user role and its associated permissions were updated."
      );

      await loadUsers();
    } catch (error) {
      setMessage(
        error?.message ||
          (ar
            ? "تعذر تحديث دور المستخدم."
            : "Unable to update user role.")
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!selectedUser || saving) return;

    if (selectedUser.id === user?.id) {
      setMessage(
        ar
          ? "لا يمكن تعطيل حساب المدير الحالي."
          : "The current administrator account cannot be deactivated."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await authApi.setUserActive(
        selectedUser.id,
        !selectedUser.active
      );

      setMessage(
        ar
          ? "تم تحديث حالة الحساب."
          : "Account status updated."
      );

      await loadUsers();
    } catch (error) {
      setMessage(
        error?.message ||
          (ar
            ? "تعذر تحديث حالة الحساب."
            : "Unable to update account status.")
      );
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      label: ar ? "إجمالي المستخدمين" : "Total users",
      value: users.length,
    },
    {
      label: ar ? "نشطون" : "Active",
      value: users.filter(
        (item) => item.active !== false
      ).length,
    },
    {
      label: ar ? "غير نشطين" : "Inactive",
      value: users.filter(
        (item) => item.active === false
      ).length,
    },
    {
      label: ar ? "الأدوار" : "Roles",
      value: Object.values(ROLES).length,
    },
  ];

  const columns = [
    {
      key: "displayName",
      label: ar ? "المستخدم" : "User",
    },
    {
      key: "email",
      label: ar ? "البريد الإلكتروني" : "Email",
    },
    {
      key: "role",
      label: ar ? "الدور" : "Role",
    },
    {
      key: "active",
      label: ar ? "الحالة" : "Status",
    },
    {
      key: "actions",
      label: ar ? "الإجراء" : "Action",
    },
  ];

  return (
    <ScreenShell
      title={ar ? "إدارة المستخدمين" : "User Management"}
      description={
        ar
          ? "إدارة حسابات المستخدمين وأدوارهم وحالاتهم وفق الصلاحيات المقررة."
          : "Manage user accounts, roles, and account status according to assigned permissions."
      }
      icon="users"
      stats={stats}
    >
      <Card>
        <div className="workflow-note">
          <strong>
            {ar
              ? "صلاحيات المستخدم مشتقة من الدور"
              : "Permissions are derived from the role"}
          </strong>
          <p>
            {ar
              ? "عند تغيير الدور يتم تطبيق الصلاحيات المرتبطة بهذا الدور تلقائيًا."
              : "Changing a role automatically applies the permissions assigned to that role."}
          </p>
        </div>
      </Card>

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
          renderCell={(row, column) => {
            if (column.key === "displayName") {
              return row.displayName || "—";
            }

            if (column.key === "role") {
              return (
                <Badge tone="neutral">
                  {ROLE_LABELS[row.role]?.[
                    language
                  ] || row.role}
                </Badge>
              );
            }

            if (column.key === "active") {
              return (
                <Badge
                  tone={
                    row.active === false
                      ? "warning"
                      : "success"
                  }
                >
                  {row.active === false
                    ? ar
                      ? "غير نشط"
                      : "Inactive"
                    : ar
                      ? "نشط"
                      : "Active"}
                </Badge>
              );
            }

            if (column.key === "actions") {
              return (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    openUser(row)
                  }
                >
                  {ar ? "تعديل" : "Manage"}
                </Button>
              );
            }

            return row[column.key] || "—";
          }}
        />
      </Card>

      {selectedUser && (
        <div ref={editSectionRef}>
          <Card
          title={
            ar
              ? "تعديل المستخدم"
              : "Manage User"
          }
        >
          <div className="workflow-detail-grid">
            <div>
              <span>
                {ar ? "المستخدم" : "User"}
              </span>
              <strong>
                {selectedUser.displayName}
              </strong>
            </div>

            <div>
              <span>
                {ar
                  ? "البريد الإلكتروني"
                  : "Email"}
              </span>
              <strong>
                {selectedUser.email}
              </strong>
            </div>

            <div>
              <span>
                {ar
                  ? "معرف المستخدم"
                  : "User ID"}
              </span>
              <strong>
                {selectedUser.id}
              </strong>
            </div>

            <div>
              <span>
                {ar ? "الحالة" : "Status"}
              </span>
              <strong>
                {selectedUser.active === false
                  ? ar
                    ? "غير نشط"
                    : "Inactive"
                  : ar
                    ? "نشط"
                    : "Active"}
              </strong>
            </div>
          </div>

          {selectedUser.id !== user?.id && (
            <>
              <div
                className="payment-form"
                style={{ marginTop: 20 }}
              >
                <Select
                  label={
                    ar
                      ? "الدور الوظيفي"
                      : "Role"
                  }
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(
                      event.target.value
                    )
                  }
                  options={roleOptions}
                  required
                />

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="button"
                    onClick={updateRole}
                    disabled={saving}
                  >
                    {saving
                      ? ar
                        ? "جارٍ الحفظ..."
                        : "Saving..."
                      : ar
                        ? "حفظ الدور"
                        : "Save Role"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={toggleActive}
                    disabled={saving}
                  >
                    {selectedUser.active === false
                      ? ar
                        ? "تفعيل الحساب"
                        : "Activate Account"
                      : ar
                        ? "تعطيل الحساب"
                        : "Deactivate Account"}
                  </Button>
                </div>
              </div>

              <div
                className="workflow-note"
                style={{ marginTop: 16 }}
              >
                <strong>
                  {ar
                    ? "الصلاحيات الحالية"
                    : "Current permissions"}
                </strong>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {(ROLE_PERMISSIONS[
                    selectedUser.role
                  ] || []
                  ).map((permission) => (
                    <Badge
                      key={permission}
                      tone="neutral"
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedUser.id === user?.id && (
            <div
              className="workflow-note"
              style={{ marginTop: 16 }}
            >
              {ar
                ? "حساب المدير الحالي محمي من تغيير الدور أو التعطيل من هذه الشاشة."
                : "The current administrator account is protected from role changes or deactivation from this screen."}
            </div>
          )}
          </Card>
        </div>
      )}

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

export default function Users() {
  return (
    <RequirePermission
      permission={PERMISSIONS.MANAGE_USERS}
    >
      <Content />
    </RequirePermission>
  );
}

