import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicationFormSchema,
  applicationStepSchemas,
} from "./applicationFormSchema";
import {
  INITIAL_APPLICATION_FORM,
} from "./applicationFormModel";

export const APPLICATION_STEP_FIELDS = Object.freeze({
  0: ["requestType", "qualificationType"],
  1: [
    "fullName",
    "nationalId",
    "phone",
    "email",
    "residence",
  ],
  2: [
    "certificateName",
    "country",
    "institution",
    "specialization",
    "secondaryBranch",
    "graduationYear",
  ],
  3: [],
});

export function useApplicationForm(
  defaultValues = INITIAL_APPLICATION_FORM
) {
  const formApi = useForm({
    defaultValues,
    resolver: zodResolver(applicationFormSchema),
    mode: "onChange",
    shouldUnregister: false,
  });

  const values = formApi.watch();

  const setForm = (nextValues) => {
    if (typeof nextValues === "function") {
      const currentValues = formApi.getValues();
      const resolvedValues = nextValues(currentValues);

      Object.entries(resolvedValues || {}).forEach(
        ([fieldName, value]) => {
          formApi.setValue(fieldName, value, {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      );

      return;
    }

    formApi.reset({
      ...INITIAL_APPLICATION_FORM,
      ...(nextValues || {}),
    });
  };

  const validateFormStep = async (step) => {
    const schema = applicationStepSchemas[step];
    const fields = APPLICATION_STEP_FIELDS[step] || [];

    if (!schema || fields.length === 0) {
      return true;
    }

    fields.forEach((field) => {
      formApi.clearErrors(field);
    });

    const result = schema.safeParse(
      formApi.getValues()
    );

    if (result.success) {
      return true;
    }

    result.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];

      if (
        typeof fieldName === "string" &&
        fields.includes(fieldName)
      ) {
        formApi.setError(fieldName, {
          type: "zod",
          message: issue.message,
        });
      }
    });

    return false;
  };

  return {
    ...formApi,
    form: values,
    setForm,
    validateFormStep,
  };
}
