/**
 * Централизованное управление темой (светлая/тёмная).
 * Тема применяется классом `dark-mode` на <html>, значение хранится в localStorage.
 */

const THEME_KEY = "theme";

export type ThemeMode = "light" | "dark";

function readStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;

  // Если пользователь ещё не выбирал тему — берём системную
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

class ThemeState {
  mode = $state<ThemeMode>("light");

  /** Инициализация: читает сохранённую тему и применяет её. */
  init(): void {
    this.mode = readStoredTheme();
    this.apply();
  }

  set(mode: ThemeMode): void {
    this.mode = mode;
    localStorage.setItem(THEME_KEY, mode);
    this.apply();
  }

  toggle(): void {
    this.set(this.mode === "dark" ? "light" : "dark");
  }

  private apply(): void {
    document.documentElement.classList.toggle("dark-mode", this.mode === "dark");
  }
}

export const theme = new ThemeState();