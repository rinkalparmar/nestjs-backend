import * as yup from 'yup';

export const signupSchema = yup.object({
  yourName: yup.string().min(2).max(30).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  dateOfBirth: yup.date().optional(),
  userName: yup.string().optional(),
  PresentAddress: yup.string().optional(),
  PermanentAddress: yup.string().optional(),
  city: yup.string().optional(),
  postalCode: yup.number().optional(),
  country: yup.string().optional(),
  mobile: yup
    .string()
    .transform((value) => String(value)) // convert numbers to strings
    .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
    .optional(),
});

export type SignupDto = yup.InferType<typeof signupSchema>;
