import { TeableConfig } from '@/types';

const CONFIG_KEY = 'teaUploaderConfig';

export function loadConfig(): TeableConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: TeableConfig): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function clearConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONFIG_KEY);
}
