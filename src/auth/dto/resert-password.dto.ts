import * as yup from 'yup';

export const resetPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .min(6, 'New password must be at least 6 characters long')
    .required('New password is required'),
  resetToken: yup.string().required('Reset token is required'),
});

export type ResetPasswordDto = yup.InferType<typeof resetPasswordSchema>;