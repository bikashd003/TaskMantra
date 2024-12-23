"use client";
import { useFormik } from "formik";
import { signUpSchema } from "@/app/Schemas/auth";

const SignUp = () => {
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: signUpSchema,
        onSubmit: values => {
            console.log(values);
        },
    });

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div className="flex items-center justify-center">
            <div className="shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold text-center text-white mb-6">Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    {/* Input for Name */}
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Name</label>
                        <input
                            name='name'
                            type='text'
                            placeholder='Name'
                            value={values.name}
                            onChange={handleChange}
                            className={`w-full p-2 rounded border ${touched.name && errors.name ? 'border-red-500' : ''} text-white`}
                        />
                        {touched.name && errors.name && <div className="text-red-500">{errors.name}</div>}
                    </div>
                    {/* Input for Email */}
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Email</label>
                        <input
                            name='email'
                            type='text'
                            placeholder='Email'
                            value={values.email}
                            onChange={handleChange}
                            className={`w-full p-2 rounded border ${touched.email && errors.email ? 'border-red-500' : ''} text-white`}
                        />
                        {touched.email && errors.email && <div className="text-red-500">{errors.email}</div>}
                    </div>

                    {/* Input for Password */}
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Password</label>
                        <input
                            name='password'
                            type='password'
                            placeholder='Password'
                            value={values.password}
                            onChange={handleChange}
                            className={`w-full p-2 rounded border ${touched.password && errors.password ? 'border-red-500' : ''}  text-white`}
                        />
                        {touched.password && errors.password && <div className="text-red-500">{errors.password}</div>}
                    </div>

                    {/* Input for Confirm Password */}
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-1">Confirm Password</label>
                        <input
                            name='confirmPassword'
                            type='password'
                            placeholder='Confirm Password'
                            value={values.confirmPassword}
                            onChange={handleChange}
                            className={`w-full p-2 rounded border ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}  text-white`}
                        />
                        {touched.confirmPassword && errors.confirmPassword && <div className="text-red-500">{errors.confirmPassword}</div>}
                    </div>

                    {/* Submit Button */}
                    <button type='submit' className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition duration-300">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
export default SignUp;