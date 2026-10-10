const BASE = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const parse = async (res) => {
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    throw new ApiError(body?.message || `Request failed (${res.status})`, res.status, body?.errors);
  }
  return body?.data;
};

// Endpoints that must never trigger a token refresh (avoids loops)
const NO_REFRESH = ["/users/login", "/users/register", "/users/refresh-token"];

let refreshing = null;

const refreshSession = () => {
  // Share one in-flight refresh between concurrent 401s
  refreshing ??= fetch(`${BASE}/users/refresh-token`, { method: "POST", credentials: "include" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => (refreshing = null), 0);
    });
  return refreshing;
};

export const request = async (path, { method = "GET", body, signal } = {}, retried = false) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    signal,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !retried && !NO_REFRESH.includes(path)) {
    if (await refreshSession()) return request(path, { method, body, signal }, true);
  }

  return parse(res);
};

// XHR so we can report upload progress
export const uploadMedia = (file, onProgress) =>
  new Promise((resolve, reject) => {
    const send = (retried) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append("media", file);

      xhr.open("POST", `${BASE}/files/upload`);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = async () => {
        if (xhr.status === 401 && !retried && (await refreshSession())) return send(true);
        let body = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          /* non-JSON error page */
        }
        if (xhr.status >= 200 && xhr.status < 300 && body?.success !== false) resolve(body.data);
        else reject(new ApiError(body?.message || "Upload failed", xhr.status));
      };
      xhr.onerror = () => reject(new ApiError("Network error — is the server running?", 0));
      xhr.send(form);
    };
    send(false);
  });

export const mediaUrl = (id, variant = "compressed", version = "") =>
  `${BASE}/files/${id}/preview?variant=${variant}${version ? `&v=${encodeURIComponent(version)}` : ""}`;

export const downloadUrl = (id) => `${BASE}/files/download/${id}`;

export const api = {
  me: () => request("/users/me"),
  login: (email, password) => request("/users/login", { method: "POST", body: { email, password } }),
  register: (data) => request("/users/register", { method: "POST", body: data }),
  logout: () => request("/users/logout", { method: "POST" }),
  updateMe: (data) => request("/users/me", { method: "PATCH", body: data }),
  changePassword: (oldPassword, newPassword) =>
    request("/users/change-password", { method: "POST", body: { oldPassword, newPassword } }),
  deleteAccount: (password) => request("/users/me", { method: "DELETE", body: { password } }),

  history: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null));
    return request(`/files/history?${qs}`);
  },
  stats: () => request("/files/stats"),
  file: (id) => request(`/files/${id}`),
  deleteFile: (id) => request(`/files/${id}`, { method: "DELETE" }),
  bulkDelete: (ids) => request("/files/bulk-delete", { method: "POST", body: { ids } }),
  clearLibrary: () => request("/files/bulk-delete", { method: "POST", body: { all: true } }),

  compressImage: (fileId, opts) => request("/compress/image", { method: "POST", body: { fileId, ...opts } }),
  compressVideo: (fileId, opts) => request("/compress/video", { method: "POST", body: { fileId, ...opts } }),
};
