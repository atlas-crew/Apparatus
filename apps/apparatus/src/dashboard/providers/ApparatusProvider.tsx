import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { ApparatusClient } from '@atlascrew/apparatus-lib';

interface HealthState {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'critical' | 'checking' | 'unknown';
  message?: string;
  latencyMs?: number;
  version?: string;
}

interface ApparatusContextValue {
  client: ApparatusClient | null;
  baseUrl: string;
  setBaseUrl: (url: string) => void;
  health: HealthState;
  isConnected: boolean;
  hasCompletedInitialHealthCheck: boolean;
}

const ApparatusContext = createContext<ApparatusContextValue | undefined>(undefined);

const STORAGE_KEY = 'apparatus-base-url';
const FALLBACK_DEV_URL = 'http://localhost:8090';
const UNCONFIGURED_BASE_URL = '';
const STATIC_DASHBOARD_HOST_SUFFIXES = ['.github.io', '.gitlab.io', '.pages.dev', '.netlify.app', '.vercel.app'];

type LocationLike = Pick<Location, 'origin' | 'protocol'> | null | undefined;
type StorageLike = Pick<Storage, 'getItem' | 'setItem'> | null | undefined;

function getDefaultLocation(): LocationLike {
  return typeof window !== 'undefined' ? window.location : undefined;
}

function getDefaultStorage(): StorageLike {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeBaseUrl(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url.replace(/\/+$/, '');
  }
}

function resolveConfiguredBaseUrl(configuredUrl: string | undefined): string | undefined {
  const trimmedUrl = configuredUrl?.trim();
  if (!trimmedUrl || !isValidUrl(trimmedUrl)) {
    return undefined;
  }

  return normalizeBaseUrl(trimmedUrl);
}

function resolveFallbackBaseUrl(locationLike: LocationLike): string {
  if (locationLike?.protocol === 'https:') {
    return UNCONFIGURED_BASE_URL;
  }

  return FALLBACK_DEV_URL;
}

function isLikelyStaticDashboardHost(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return STATIC_DASHBOARD_HOST_SUFFIXES.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export function resolveDefaultBaseUrl(
  locationLike: LocationLike = getDefaultLocation(),
  configuredUrl: string | undefined = import.meta.env.VITE_APPARATUS_API_URL
): string {
  const configuredBaseUrl = resolveConfiguredBaseUrl(configuredUrl);
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (locationLike?.origin && locationLike.protocol !== 'file:') {
    const normalizedOrigin = normalizeBaseUrl(locationLike.origin);
    if (isValidUrl(normalizedOrigin) && !isLikelyStaticDashboardHost(normalizedOrigin)) {
      return normalizedOrigin;
    }

    if (isValidUrl(normalizedOrigin) && locationLike.protocol === 'https:' && isLikelyStaticDashboardHost(normalizedOrigin)) {
      console.info('Static dashboard host detected; configure the Apparatus API URL explicitly.');
    }
  }

  return resolveFallbackBaseUrl(locationLike);
}

export function resolveStoredBaseUrl(
  storage: StorageLike = getDefaultStorage(),
  locationLike: LocationLike = getDefaultLocation(),
  configuredUrl: string | undefined = import.meta.env.VITE_APPARATUS_API_URL
): string {
  const fallback = resolveDefaultBaseUrl(locationLike, configuredUrl);
  try {
    const storedUrl = storage?.getItem(STORAGE_KEY);
    if (storedUrl && isValidUrl(storedUrl)) {
      return normalizeBaseUrl(storedUrl);
    }
  } catch {
    // localStorage unavailable
  }

  return fallback;
}

function saveUrl(url: string, storage: StorageLike = getDefaultStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, normalizeBaseUrl(url));
  } catch {
    // localStorage unavailable
  }
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

interface ApparatusProviderProps {
  children: ReactNode;
  defaultUrl?: string;
}

export function ApparatusProvider({ children, defaultUrl }: ApparatusProviderProps) {
  const [baseUrl, setBaseUrlState] = useState<string>(() =>
    normalizeBaseUrl(defaultUrl ?? resolveStoredBaseUrl())
  );
  const [health, setHealth] = useState<HealthState>({ status: 'unknown' });
  const [hasCompletedInitialHealthCheck, setHasCompletedInitialHealthCheck] = useState(false);

  // Create client when baseUrl changes (with validation)
  const client = useMemo(() => {
    if (!baseUrl || !isValidUrl(baseUrl)) return null;
    return new ApparatusClient({ baseUrl });
  }, [baseUrl]);

  // Validated URL setter
  const setBaseUrl = useCallback((newUrl: string) => {
    if (!isValidUrl(newUrl)) {
      console.warn('Invalid URL rejected:', newUrl);
      return;
    }
    const normalizedUrl = normalizeBaseUrl(newUrl);
    setBaseUrlState(normalizedUrl);
    saveUrl(normalizedUrl);
  }, []);

  // Health check with proper cleanup
  useEffect(() => {
    // Re-arm boot readiness whenever the client endpoint changes.
    setHasCompletedInitialHealthCheck(false);

    if (!client) {
      setHealth({
        status: 'unknown',
        message: baseUrl ? 'No client configured' : 'Set Apparatus API URL in Settings',
      });
      setHasCompletedInitialHealthCheck(true);
      return;
    }

    const abortController = new AbortController();
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isInitialCheck = true; // Ensure readiness flips only once per effect lifecycle.

    const checkHealth = async () => {
      if (abortController.signal.aborted) return;

      setHealth((prev) => ({ ...prev, status: 'checking' }));
      const start = performance.now();

      try {
        const response = await client.core.health();
        if (abortController.signal.aborted) return;

        setHealth({
          status: 'healthy',
          message: 'Connected',
          latencyMs: Math.round(performance.now() - start),
          version: response.version,
        });
      } catch (error) {
        if (abortController.signal.aborted) return;
        setHealth({
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Connection failed',
        });
      } finally {
        if (!abortController.signal.aborted && isInitialCheck) {
          isInitialCheck = false;
          setHasCompletedInitialHealthCheck(true);
        }
      }
    };

    // Initial check
    checkHealth();

    // Poll every 30 seconds
    intervalId = setInterval(checkHealth, 30000);

    return () => {
      abortController.abort();
      if (intervalId) clearInterval(intervalId);
    };
  }, [client]);

  // Memoize context value
  const isConnected = health.status === 'healthy';
  const contextValue = useMemo<ApparatusContextValue>(
    () => ({
      client,
      baseUrl,
      setBaseUrl,
      health,
      isConnected,
      hasCompletedInitialHealthCheck,
    }),
    [client, baseUrl, setBaseUrl, health, isConnected, hasCompletedInitialHealthCheck]
  );

  return (
    <ApparatusContext.Provider value={contextValue}>
      {children}
    </ApparatusContext.Provider>
  );
}

/**
 * Hook to access Apparatus client context.
 * @throws Error if used outside of ApparatusProvider
 */
export function useApparatus(): ApparatusContextValue {
  const context = useContext(ApparatusContext);
  if (context === undefined) {
    throw new Error('useApparatus must be used within a ApparatusProvider');
  }
  return context;
}
