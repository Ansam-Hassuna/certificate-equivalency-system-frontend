import React, { useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import {
  getApplicantProfile,
  saveApplicantProfile,
} from "../features/profile/profileStore";
import "./Profile.css";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const { language } = useLanguage();
  const fileInputRef = useRef(null);

  const isArabic = language === "ar";

  const storedProfile = useMemo(
    () =>
      getApplicantProfile(user?.id) || {},
    [user?.id]
  );

  const [form, setForm] = useState(() => ({
    fullName:
      storedProfile.fullName ||
      user?.displayName ||
      user?.name ||
      "",
    nationalId:
      storedProfile.nationalId || "",
    identityType:
      storedProfile.identityType || "",
    gender:
      storedProfile.gender || "",
    dateOfBirth:
      storedProfile.dateOfBirth || "",
    nationality:
      storedProfile.nationality || "",
    email:
      user?.email ||
      storedProfile.email ||
      "",
    backupEmail:
      storedProfile.backupEmail || "",
    phone:
      storedProfile.phone || "",
    whatsapp:
      storedProfile.whatsapp || "",
    whatsappPrefix:
      storedProfile.whatsappPrefix || "+970",
    country:
      storedProfile.country || "palestine",
    city:
      storedProfile.city || "",
    address:
      storedProfile.address || "",
    imageUrl:
      storedProfile.imageUrl ||
      user?.imageUrl ||
      "",
  }));

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const countryOptions = [
    {
      value: "palestine",
      label: isArabic ? "فلسطين" : "Palestine",
    },
    {
      value: "jordan",
      label: isArabic ? "الأردن" : "Jordan",
    },
    {
      value: "egypt",
      label: isArabic ? "مصر" : "Egypt",
    },
    {
      value: "saudi-arabia",
      label: isArabic ? "السعودية" : "Saudi Arabia",
    },
    {
      value: "uae",
      label: isArabic
        ? "الإمارات العربية المتحدة"
        : "United Arab Emirates",
    },
    {
      value: "turkey",
      label: isArabic ? "تركيا" : "Turkey",
    },
    {
      value: "malaysia",
      label: isArabic ? "ماليزيا" : "Malaysia",
    },
    {
      value: "other",
      label: isArabic ? "دولة أخرى" : "Other",
    },
  ];
  const whatsappPrefixes = {
    palestine: "+970",
    jordan: "+962",
    egypt: "+20",
    "saudi-arabia": "+966",
    uae: "+971",
    turkey: "+90",
    malaysia: "+60",
  };
  const update = (key) => (event) => {
    setMessage("");
    setError("");

    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const requiredFields = [
    "nationalId",
    "identityType",
    "fullName",
    "gender",
    "dateOfBirth",
    "nationality",
    "backupEmail",
    "phone",
    "whatsapp",
    "whatsappPrefix",
    "country",
    "city",
    "address",
    "imageUrl",
  ];

  const completedFields =
    requiredFields.filter((key) =>
      String(form[key] || "").trim()
    ).length;

  const completion =
    Math.round(
      (completedFields /
        requiredFields.length) *
        100
    );

  const profileComplete =
    completedFields ===
    requiredFields.length;

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        isArabic
          ? "يرجى اختيار ملف صورة."
          : "Please select an image file."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        isArabic
          ? "حجم الصورة يجب ألا يتجاوز 2 ميجابايت."
          : "Image size must not exceed 2 MB."
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageUrl:
          String(reader.result || ""),
      }));
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removeImage = () => {
    setMessage("");
    setError("");

    setForm((current) => ({
      ...current,
      imageUrl: "",
    }));
  };

  const save = () => {
    setMessage("");
    setError("");

    if (!user?.id) {
      setError(
        isArabic
          ? "تعذر تحديد المستخدم الحالي."
          : "Unable to identify the current user."
      );
      return;
    }

    if (!form.imageUrl) {
      setError(
        isArabic
          ? "الصورة الشخصية مطلوبة قبل حفظ الملف الشخصي."
          : "A profile picture is required before saving the profile."
      );
      return;
    }

    if (!profileComplete) {
      setError(
        isArabic
          ? "يرجى استكمال جميع البيانات المطلوبة قبل الحفظ."
          : "Please complete all required fields before saving."
      );
      return;
    }

    const profile = {
      ...form,
      email: user.email || form.email,
    };

    saveApplicantProfile(
      user.id,
      profile
    );

    const result =
      updateUserProfile({
        name: form.fullName.trim(),
        displayName:
          form.fullName.trim(),
        imageUrl:
          form.imageUrl || null,
      });

    if (!result?.ok) {
      setError(
        isArabic
          ? "تعذر تحديث بيانات الحساب."
          : "Unable to update account data."
      );
      return;
    }

    setMessage(
      isArabic
        ? "تم حفظ الملف الشخصي بنجاح."
        : "Profile saved successfully."
    );
  };

  const profileImage =
    form.imageUrl || null;

  return (
    <div className="page profile-page">
      <header className="profile-page__heading">
        <div>
          <div className="profile-page__eyebrow">
            {isArabic
              ? "حساب المستخدم"
              : "User account"}
          </div>

          <h1>
            {isArabic
              ? "الملف الشخصي"
              : "Profile"}
          </h1>

          <p>
            {isArabic
              ? "حدّث بياناتك الشخصية مرة واحدة ليتم استخدامها تلقائيًا عند تقديم طلب جديد."
              : "Update your personal information once and reuse it automatically when creating a new application."}
          </p>
        </div>
      </header>

      {message && (
        <div
          className="profile-page__message profile-page__message--success"
          role="status"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          className="profile-page__message profile-page__message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="profile-page__grid">
        <Card>
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={
                    isArabic
                      ? "الصورة الشخصية"
                      : "Profile picture"
                  }
                />
              ) : (
                <Icon
                  name="user"
                  size={48}
                />
              )}
            </div>

            <div className="profile-avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handleImageChange
                }
              />

              <Button
                variant="secondary"
                icon={
                  <Icon
                    name="image"
                    size={18}
                  />
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                {isArabic
                  ? "تغيير الصورة"
                  : "Change picture"}
              </Button>

              {profileImage && (
                <Button
                  variant="ghost"
                  onClick={removeImage}
                >
                  {isArabic
                    ? "إزالة الصورة"
                    : "Remove picture"}
                </Button>
              )}
            </div>

            <p className="profile-avatar-required">
              {isArabic
                ? "الصورة الشخصية مطلوبة"
                : "Profile picture is required"}
            </p>

            <div className="profile-completion">
              <div className="profile-completion__row">
                <span>
                  {isArabic
                    ? "اكتمال الملف"
                    : "Profile completion"}
                </span>

                <strong>
                  {completion}%
                </strong>
              </div>

              <div className="profile-completion__track">
                <span
                  style={{
                    width: `${completion}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title={
            isArabic
              ? "المعلومات الشخصية"
              : "Personal information"
          }
        >
          <div className="profile-form-grid">
            <Input
              label={
                isArabic
                  ? "رقم الهوية"
                  : "Identity number"
              }
              value={form.nationalId}
              onChange={update(
                "nationalId"
              )}
              required
            />

            <Select
              label={
                isArabic
                  ? "نوع الهوية"
                  : "Identity type"
              }
              value={form.identityType}
              onChange={update(
                "identityType"
              )}
              options={[
                {
                  value: "national-id",
                  label: isArabic
                    ? "الهوية الوطنية"
                    : "National ID",
                },
                {
                  value: "passport",
                  label: isArabic
                    ? "جواز السفر"
                    : "Passport",
                },
              ]}
              placeholder={
                isArabic
                  ? "اختر نوع الهوية"
                  : "Select identity type"
              }
              required
            />

            <Input
              label={
                isArabic
                  ? "الاسم الكامل"
                  : "Full name"
              }
              value={form.fullName}
              onChange={update(
                "fullName"
              )}
              required
            />

            <Select
              label={
                isArabic
                  ? "الجنس"
                  : "Gender"
              }
              value={form.gender}
              onChange={update("gender")}
              options={[
                {
                  value: "male",
                  label: isArabic
                    ? "ذكر"
                    : "Male",
                },
                {
                  value: "female",
                  label: isArabic
                    ? "أنثى"
                    : "Female",
                },
              ]}
              placeholder={
                isArabic
                  ? "اختر الجنس"
                  : "Select gender"
              }
              required
            />

            <Input
              label={
                isArabic
                  ? "تاريخ الميلاد"
                  : "Date of birth"
              }
              type="date"
              value={form.dateOfBirth}
              onChange={update(
                "dateOfBirth"
              )}
              required
            />

            <Input
              label={
                isArabic
                  ? "الجنسية"
                  : "Nationality"
              }
              value={form.nationality}
              onChange={update(
                "nationality"
              )}
              required
            />
          </div>
        </Card>

        <Card
          title={
            isArabic
              ? "بيانات التواصل"
              : "Contact information"
          }
        >
          <div className="profile-form-grid">
            <Input
              label={
                isArabic
                  ? "البريد الإلكتروني"
                  : "Email"
              }
              type="email"
              value={form.email}
              disabled
            />

            <Input
              label={
                isArabic
                  ? "البريد الإلكتروني الاحتياطي"
                  : "Backup email"
              }
              type="email"
              value={form.backupEmail}
              onChange={update("backupEmail")}
              required
            />

            <Input
              label={
                isArabic
                  ? "رقم الهاتف"
                  : "Phone number"
              }
              value={form.phone}
              onChange={update("phone")}
              required
            />

            <div className="profile-whatsapp-field">
              <span className="profile-whatsapp-label">
                {isArabic
                  ? "رقم واتساب"
                  : "WhatsApp number"}
              </span>

              <div className="profile-whatsapp-control">
                <div
                  className="profile-whatsapp-prefix"
                  aria-label={
                    isArabic
                      ? "مقدمة الدولة"
                      : "Country code"
                  }
                >
                  <span className="profile-whatsapp-flag">
                    {form.country === "palestine"
                      ? "🇵🇸"
                      : form.country === "jordan"
                      ? "🇯🇴"
                      : form.country === "egypt"
                      ? "🇪🇬"
                      : form.country === "saudi-arabia"
                      ? "🇸🇦"
                      : form.country === "uae"
                      ? "🇦🇪"
                      : form.country === "turkey"
                      ? "🇹🇷"
                      : form.country === "malaysia"
                      ? "🇲🇾"
                      : "🌐"}
                  </span>

                  <strong>
                    {form.whatsappPrefix || "—"}
                  </strong>
                </div>

                <input
                  className="profile-whatsapp-input"
                  type="tel"
                  value={form.whatsapp}
                  onChange={update("whatsapp")}
                  placeholder={
                    isArabic
                      ? "59 123 4567"
                      : "59 123 4567"
                  }
                  aria-label={
                    isArabic
                      ? "رقم واتساب"
                      : "WhatsApp number"
                  }
                  required
                />
              </div>

              <span className="profile-whatsapp-preview">
                {form.whatsappPrefix || ""}
                {form.whatsapp
                  ? ` ${form.whatsapp}`
                  : ""}
              </span>
            </div>
          </div>

          <p className="profile-page__hint">
            {isArabic
              ? "البريد الإلكتروني مرتبط بحسابك ولا يتم تغييره من هذه الصفحة."
              : "Your email is linked to your account and cannot be changed from this page."}
          </p>
        </Card>

        <Card
          title={
            isArabic
              ? "العنوان"
              : "Address"
          }
        >
          <div className="profile-form-grid">
            <Select
              label={
                isArabic
                  ? "الدولة"
                  : "Country"
              }
              value={form.country}
              onChange={(event) => {
                const nextCountry =
                  event.target.value;

                setMessage("");
                setError("");

                setForm((current) => ({
                  ...current,
                  country: nextCountry,
                  whatsappPrefix:
                    whatsappPrefixes[nextCountry] ||
                    "",
                }));
              }}
              options={countryOptions}
              placeholder={
                isArabic
                  ? "اختر الدولة"
                  : "Select country"
              }
              required
            />

            <Input
              label={
                isArabic
                  ? "المدينة"
                  : "City"
              }
              value={form.city}
              onChange={update("city")}
              required
            />

            <Input
              label={
                isArabic
                  ? "العنوان"
                  : "Address"
              }
              value={form.address}
              onChange={update("address")}
              required
            />
          </div>
        </Card>
      </div>

      <footer className="profile-page__footer">
        <Button
          onClick={save}
          disabled={!profileComplete}
          icon={
            <Icon
              name="save"
              size={18}
            />
          }
        >
          {isArabic
            ? "حفظ التغييرات"
            : "Save changes"}
        </Button>
      </footer>
    </div>
  );
}






