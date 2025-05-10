import * as yup from 'yup';

export const changePasswordSchema = yup.object({
  oldPassword: yup.string().required('Old password is required'),
  newPassword: yup
    .string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
});

export type changePasswordDto = yup.InferType<typeof changePasswordSchema>;