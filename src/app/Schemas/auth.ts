import * as yup from 'yup';

export const signInSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required(),
});
export const signUpSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required(),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match'),
});