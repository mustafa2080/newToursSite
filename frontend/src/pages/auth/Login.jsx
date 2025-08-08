import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FormField from '../../components/common/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginValidationRules } from '../../utils/validationRules';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Use form validation hook
  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    getFieldStatus,
    setErrors
  } = useFormValidation(
    { email: '', password: '' },
    loginValidationRules,
    300 // 300ms debounce
  );



  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      setErrors({ general: error });
      clearError();
    }
  }, [error, clearError]);





  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateAll();
    if (!isValid) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100"
          >
            <span className="text-2xl font-bold text-blue-600">T</span>
          </motion.div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm"
              >
                {errors.general}
              </motion.div>
            )}

            <FormField
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
              error={errors.email}
              status={getFieldStatus('email')}
              autoComplete="email"
            />

            <FormField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              required
              error={errors.password}
              status={getFieldStatus('password')}
              showPasswordToggle
              showPassword={showPassword}
              onPasswordToggle={() => setShowPassword(!showPassword)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
                size="large"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
