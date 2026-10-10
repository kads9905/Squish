import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, AtSign, Check, Lock } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email ?? "", password: "" });
  const justRegistered = Boolean(location.state?.justRegistered);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate("/welcome", { replace: true, state: { user, from: location.state?.from || "/app" } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          New to Squish?{" "}
          <Link to="/register" className="font-semibold text-ink underline decoration-accent decoration-[3px] underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      {justRegistered && (
        <p role="status" className="mb-5 flex animate-pop-in items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold">
          <Check className="size-4 shrink-0" strokeWidth={3} />
          Account created. Log in to start squishing.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          label="Email or username"
          icon={AtSign}
          autoComplete="username"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          placeholder="••••••••"
          autoFocus={justRegistered}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!form.email || !form.password}>
          Log in <ArrowRight className="size-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}
