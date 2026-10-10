import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, AtSign, Lock, Mail, User } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/cn";

// Mirrors the backend rules so users get feedback before submitting
const validate = (f) => {
  const errors = {};
  if (!f.fullName.trim()) errors.fullName = "Tell us your name";
  if (!/^[a-z0-9_.]{3,30}$/.test(f.username.trim().toLowerCase()))
    errors.username = "3–30 characters: letters, numbers, _ or .";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = "Enter a valid email";
  if (f.password.length < 8) errors.password = "At least 8 characters";
  return errors;
};

const strength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const errors = validate(form);
  const valid = Object.keys(errors).length === 0;
  const score = strength(form.password);

  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    error: touched[name] ? errors[name] : undefined,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, username: true, email: true, password: true });
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      await register({ ...form, username: form.username.trim().toLowerCase() });
      navigate("/login", { replace: true, state: { email: form.email.trim(), justRegistered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Start squishing."
      subtitle="Free, no watermarks, no card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink underline decoration-accent decoration-[3px] underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" icon={User} autoComplete="name" placeholder="Ada Lovelace" {...field("fullName")} />
          <Input label="Username" icon={AtSign} autoComplete="username" placeholder="ada" {...field("username")} />
        </div>
        <Input label="Email" type="email" icon={Mail} autoComplete="email" placeholder="you@example.com" {...field("email")} />
        <div>
          <Input
            label="Password"
            type="password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...field("password")}
          />
          {form.password && (
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < score ? (score <= 1 ? "bg-danger" : score <= 2 ? "bg-warning" : "bg-fill") : "bg-soft"
                  )}
                />
              ))}
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
