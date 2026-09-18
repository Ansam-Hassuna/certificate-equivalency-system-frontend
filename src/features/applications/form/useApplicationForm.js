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
  const form = useForm({
    defaultValues,
    resolver: zodResolver(applicationFormSchema),
    mode: "onChange",
    shouldUnregister: false,
  });

  const validateFormStep = async (step) => {
    const schema = applicationStepSchemas[step];
    const fields = APPLICATION_STEP_FIELDS[step] || [];

    if (!schema || fields.length === 0) {
      return true;
    }

    fields.forEach((field) => {
      form.clearErrors(field);
    });

    const result = schema.safeParse(form.getValues());

    if (result.success) {
      return true;
    }

    result.error.issues.forEach((issue) => {
      const fieldName = issue.path[0];

      if (
        typeof fieldName === "string" &&
        fields.includes(fieldName)
      ) {
        form.setError(fieldName, {
          type: "zod",
          message: issue.message,
        });
      }
    });

    return false;
  };

  return {
    ...form,
    validateFormStep,
  };
}
