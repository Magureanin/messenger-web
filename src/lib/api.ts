/**
 * Центральный модуль для работы с backend API.
 * Все запросы к серверу должны идти через этот модуль, чтобы:
 *  - не дублировать базовый URL по всему проекту;
 *  - единообразно обрабатывать ошибки;
 *  - иметь строгую типизацию ответов.
 */

// Базовый адрес API можно переопределить через переменную окружения VITE_API_URL
// (см. файл .env). По умолчанию используется локальный сервер разработки.
const RAW_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

const TOKEN_KEY = "token";

/* ----------------------------- Работа с токеном ---------------------------- */

export function getToken(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Заголовки авторизации для защищённых запросов. */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
}

/** Преобразует относительный путь к файлу на сервере в абсолютный URL. */
export function fileUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* --------------------------------- Типы API -------------------------------- */

export interface User {
  id: number;
  username: string;
}

export interface Contact {
  id: number;
  username: string;
  last_active?: number;
}

export interface Message {
  id: number;
  content: string | null;
  file_url: string | null;
  date_sent: string;
  id_sender: number;
  id_receiver: number;
  status?: "sent" | "read" | "pending" | string;
}

/* ------------------------------ Обработка ошибок --------------------------- */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extractError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  } catch {
    /* тело ответа не JSON — игнорируем */
  }
  return `Ошибка запроса (${response.status})`;
}

/** Универсальный запрос с разбором JSON и обработкой ошибок. */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    throw new ApiError(await extractError(response), response.status);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/* -------------------------------- Endpoints -------------------------------- */

export const api = {
  /** Авторизация. Возвращает access-токен. */
  async login(username: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const data = await request<{ access_token: string }>("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    return data.access_token;
  },

  getMe(): Promise<User> {
    return request<User>("/users/me", { headers: authHeaders() });
  },

  getContacts(): Promise<Contact[]> {
    return request<Contact[]>("/contacts", {
      headers: authHeaders({ "Cache-Control": "no-cache" }),
      cache: "no-store",
    });
  },

  getMessages(companionId: number): Promise<Message[]> {
    return request<Message[]>(`/messagesGet?idcompanion=${companionId}`, {
      headers: authHeaders(),
    });
  },

  markMessagesRead(senderId: number): Promise<void> {
    return request<void>("/messagesMarkRead", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id_sender: senderId }),
    });
  },

  createMessage(payload: {
    id_receiver: number;
    content: string | null;
    file_url: string | null;
  }): Promise<Message> {
    return request<Message>("/messagesCreate", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
  },

  changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return request<void>("/users/me/password", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  },

  /** Загрузка файла. Возвращает относительный путь к загруженному файлу. */
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const data = await request<{ file_url: string }>("/upload", {
      method: "POST",
      headers: authHeaders(), // Content-Type выставит браузер (multipart/form-data)
      body: formData,
    });
    return data.file_url;
  },
};