import { useState } from "react";
import { AtSign, Lock, Mail, Trash2, User, FolderX } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import SegmentedControl from "../../components/ui/SegmentedControl";
import { useToast } from "../../context/ToastContext";

function ProfileCard() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: user.fullName, username: user.username });
  const [saving, setSaving] = useState(false);

  const dirty = form.fullName !== user.fullName || form.username !== user.username;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const changes = {};
      if (form.fullName !== user.fullName) changes.fullName = form.fullName;
      if (form.username !== user.username) changes.username = form.username;
      const updated = await api.updateMe(changes);
      setUser(updated);
      setForm({ fullName: updated.fullName, username: updated.username });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Profile" description={`Member since ${formatDate(user.createdAt)}`} />
      <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" icon={User} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input
            label="Username"
            icon={AtSign}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
          />
        </div>
        <Input label="Email" icon={Mail} value={user.email} disabled hint="Email can't be changed." />
        <div className="flex justify-end gap-2 pt-2">
          {dirty && (
            <Button variant="secondary" onClick={() => setForm({ fullName: user.fullName, username: user.username })}>
              Reset
            </Button>
          )}
          <Button type="submit" loading={saving} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const mismatch = form.confirm && form.confirm !== form.newPassword;
  const tooShort = form.newPassword && form.newPassword.length < 8;
  const canSubmit = form.oldPassword && form.newPassword && !mismatch && !tooShort && form.confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.changePassword(form.oldPassword, form.newPassword);
      setForm({ oldPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Password" description="Use at least 8 characters." />
      <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
        <Input
          label="Current password"
          type="password"
          icon={Lock}
          autoComplete="current-password"
          value={form.oldPassword}
          onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            error={tooShort ? "At least 8 characters" : undefined}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            error={mismatch ? "Passwords don't match" : undefined}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving} disabled={!canSubmit}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AppearanceCard() {
  const { preference, setTheme } = useTheme();
  return (
    <Card>
      <CardHeader title="Appearance" description="Light, dark, or follow your device." />
      <div className="p-6">
        <SegmentedControl
          ariaLabel="Theme"
          value={preference}
          onChange={setTheme}
          className="max-w-sm"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </div>
    </Card>
  );
}

function DangerZone() {
  const { signOut } = useAuth();
  const toast = useToast();
  const [modal, setModal] = useState(null); // "clear" | "delete"
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (busy) return;
    setModal(null);
    setPassword("");
  };

  const onClear = async () => {
    setBusy(true);
    try {
      const { deletedCount } = await api.clearLibrary();
      toast.success(`Library cleared — ${deletedCount} ${deletedCount === 1 ? "file" : "files"} removed`);
      setModal(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await api.deleteAccount(password);
      signOut("/");
      toast.bye("Your account has been deleted. Bye for now.");
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Danger zone" description="These can't be undone." />
      <div className="mt-4 divide-y divide-line border-t border-line">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold">Clear library</p>
            <p className="text-[13px] text-ink-muted">Delete every uploaded and compressed file, but keep your account.</p>
          </div>
          <Button variant="outline" onClick={() => setModal("clear")}>
            <FolderX className="size-4" /> Clear library
          </Button>
        </div>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold">Delete account</p>
            <p className="text-[13px] text-ink-muted">Remove your account and all of its files from Squish.</p>
          </div>
          <Button variant="danger" onClick={() => setModal("delete")}>
            <Trash2 className="size-4" /> Delete account
          </Button>
        </div>
      </div>

      <Modal
        open={modal === "clear"}
        onClose={close}
        title="Clear your library?"
        description="All originals and compressed outputs will be deleted. Files that are still processing are skipped."
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onClear} loading={busy}>
              Clear library
            </Button>
          </>
        }
      />

      <Modal
        open={modal === "delete"}
        onClose={close}
        title="Delete your account?"
        description="This erases your profile and every file. Enter your password to confirm."
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete} loading={busy} disabled={!password}>
              Delete forever
            </Button>
          </>
        }
      >
        <Input
          type="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && password && onDelete()}
        />
      </Modal>
    </Card>
  );
}

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, password and data." />
      <div className="max-w-3xl space-y-6">
        <ProfileCard />
        <PasswordCard />
        <AppearanceCard />
        <DangerZone />
      </div>
    </>
  );
}
