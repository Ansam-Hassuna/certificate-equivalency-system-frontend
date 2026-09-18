import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const applicationFormSchema = z.object({
  requestType: z.string(),
  qualificationType: z.string(),

  secondaryBranch: z.string(),
  hasInternationalExam: z.boolean(),

  fullName: z.string(),
  nationalId: z.string(),
  phone: z.string(),
  email: z.string(),
  residence: z.string(),

  certificateName: z.string(),
  institution: z.string(),
  country: z.string(),
  specialization: z.string(),
  graduationYear: z.string(),

  notes: z.string(),
});

export const applicationStepSchemas = {
  0: applicationFormSchema.pick({
    requestType: true,
    qualificationType: true,
  }).extend({
    requestType: nonEmptyString,
    qualificationType: nonEmptyString,
  }),

  1: applicationFormSchema.pick({
    fullName: true,
    nationalId: true,
    phone: true,
    email: true,
    residence: true,
  }).extend({
    fullName: nonEmptyString,
    nationalId: nonEmptyString,
    phone: nonEmptyString,
    email: z.string().trim().email(),
    residence: nonEmptyString,
  }),

  2: applicationFormSchema.pick({
    qualificationType: true,
    certificateName: true,
    country: true,
    institution: true,
    specialization: true,
    secondaryBranch: true,
    graduationYear: true,
  }).superRefine((data, context) => {
    if (!data.certificateName.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["certificateName"],
        message: "Certificate name is required",
      });
    }

    if (!data.country.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["country"],
        message: "Country is required",
      });
    }

    if (!data.institution.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["institution"],
        message: "Institution is required",
      });
    }

    if (!data.graduationYear.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["graduationYear"],
        message: "Graduation year is required",
      });
    }

    if (data.qualificationType === "secondary") {
      if (!data.secondaryBranch.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["secondaryBranch"],
          message: "Secondary branch is required",
        });
      }
    } else if (!data.specialization.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialization"],
        message: "Specialization is required",
      });
    }
  }),
};

export function validateApplicationFormStep(step, data) {
  const schema = applicationStepSchemas[step];

  if (!schema) {
    return {
      success: false,
      error: new Error(`Unknown application step: ${step}`),
    };
  }

  return schema.safeParse(data);
}
