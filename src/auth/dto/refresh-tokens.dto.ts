import * as yup from 'yup';

export const refreshTokenSchema = yup.object({
  refreshToken: yup.string().required('Token is required'),
});

export type refreshTokenDto = yup.InferType<typeof refreshTokenSchema>;
