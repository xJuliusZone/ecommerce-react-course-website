import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AUTH_MODE = {
  SIGNUP: "signup",
  LOGIN: "login",
} as const;

type AuthMode = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];

interface AuthFormValues {
  email: string;
  password: string;
}

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>(AUTH_MODE.SIGNUP);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { signUp, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>();

  function onSubmit(data: AuthFormValues) {
    setError(null);
    let result;
    if (mode === AUTH_MODE.SIGNUP) {
      result = signUp(data.email, data.password);
    } else {
      result = login(data.email, data.password);
    }

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error ?? "Authentication failed");
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="auth-container">
          <h1 className="page-title">
            {mode === AUTH_MODE.SIGNUP ? "Sign Up" : "Login"}
          </h1>
          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                className="form-input"
                type="email"
                id="email"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  maxLength: {
                    value: 12,
                    message: "Password must be less than 12 characters",
                  },
                })}
                className="form-input"
                type="password"
                id="password"
              />
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-large">
              {mode === AUTH_MODE.SIGNUP ? "Sign Up" : "Login"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === AUTH_MODE.SIGNUP ? (
              <p>
                Already have an account?{" "}
                <span
                  className="auth-link"
                  onClick={() => setMode(AUTH_MODE.LOGIN)}
                >
                  Login
                </span>
              </p>
            ) : (
              <p>
                {" "}
                Don't have an account?{" "}
                <span
                  className="auth-link"
                  onClick={() => setMode(AUTH_MODE.SIGNUP)}
                >
                  Sign Up
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
