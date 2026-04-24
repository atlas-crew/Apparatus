// @vitest-environment jsdom
import { createElement, useEffect } from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApparatusProvider, resolveDefaultBaseUrl, resolveStoredBaseUrl, useApparatus } from './ApparatusProvider';

function ProviderProbe() {
  const { baseUrl, health } = useApparatus();
  return createElement(
    'div',
    undefined,
    createElement('span', { 'data-testid': 'base-url' }, baseUrl),
    createElement('span', { 'data-testid': 'health-message' }, health.message)
  );
}

function ProviderSetter({ nextUrl }: { nextUrl: string }) {
  const { baseUrl, setBaseUrl } = useApparatus();

  useEffect(() => {
    setBaseUrl(nextUrl);
  }, [nextUrl, setBaseUrl]);

  return createElement('span', { 'data-testid': 'base-url' }, baseUrl);
}

describe('ApparatusProvider base URL resolution', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('uses the current browser origin when the dashboard is served from the app host', () => {
    expect(
      resolveDefaultBaseUrl({
        origin: 'http://127.0.0.1:18090',
        protocol: 'http:',
      })
    ).toBe('http://127.0.0.1:18090');
  });

  it('falls back to the legacy localhost default when no browser origin is available', () => {
    expect(resolveDefaultBaseUrl(null)).toBe('http://localhost:8090');
    expect(
      resolveDefaultBaseUrl({
        origin: 'file://',
        protocol: 'file:',
      })
    ).toBe('http://localhost:8090');
  });

  it('falls back to the dev default when the browser origin is opaque', () => {
    expect(
      resolveDefaultBaseUrl({
        origin: 'null',
        protocol: 'https:',
      })
    ).toBe('');
  });

  it('prefers a configured API URL override when one is provided', () => {
    expect(
      resolveDefaultBaseUrl(
        {
          origin: 'https://atlascrew.github.io',
          protocol: 'https:',
        },
        'https://api.apparatus.test/root/'
      )
    ).toBe('https://api.apparatus.test');
  });

  it('trims whitespace around configured API URL overrides', () => {
    expect(
      resolveDefaultBaseUrl(
        {
          origin: 'http://127.0.0.1:18090',
          protocol: 'http:',
        },
        '  https://api.apparatus.test/root/  '
      )
    ).toBe('https://api.apparatus.test');
  });

  it('ignores invalid configured API URL overrides', () => {
    expect(
      resolveDefaultBaseUrl(
        {
          origin: 'http://127.0.0.1:18090',
          protocol: 'http:',
        },
        'javascript:alert(1)'
      )
    ).toBe('http://127.0.0.1:18090');
  });

  it('falls back to the legacy localhost default for static hosted dashboards', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const staticOrigins = [
      'https://atlascrew.github.io',
      'https://docs.gitlab.io',
      'https://demo.pages.dev',
      'https://apparatus-demo.netlify.app',
      'https://apparatus-demo.vercel.app',
      'https://github.io',
    ];

    for (const origin of staticOrigins) {
      expect(
        resolveDefaultBaseUrl({
          origin,
          protocol: 'https:',
        })
      ).toBe('');
    }

    expect(infoSpy).toHaveBeenCalled();
  });

  it('prefers a stored override when one is present', () => {
    expect(
      resolveStoredBaseUrl(
        {
          getItem: () => 'http://appliance.internal:9090/',
          setItem: () => undefined,
        },
        {
          origin: 'http://127.0.0.1:18090',
          protocol: 'http:',
        }
      )
    ).toBe('http://appliance.internal:9090');
  });

  it('ignores invalid stored overrides and falls back to the resolved default', () => {
    expect(
      resolveStoredBaseUrl(
        {
          getItem: () => 'javascript:alert(1)',
          setItem: () => undefined,
        },
        {
          origin: 'http://127.0.0.1:18090',
          protocol: 'http:',
        }
      )
    ).toBe('http://127.0.0.1:18090');
  });

  it('falls back when storage access throws', () => {
    expect(
      resolveStoredBaseUrl(
        {
          getItem: () => {
            throw new Error('storage unavailable');
          },
          setItem: () => undefined,
        },
        {
          origin: 'http://127.0.0.1:18090',
          protocol: 'http:',
        }
      )
    ).toBe('http://127.0.0.1:18090');
  });

  it('shows a setup message when no API URL is configured', async () => {
    const view = render(
      createElement(
        ApparatusProvider,
        { defaultUrl: '', children: createElement(ProviderProbe) }
      )
    );

    await waitFor(() => {
      expect(view.getByTestId('health-message').textContent).toBe('Set Apparatus API URL in Settings');
    });
  });

  it('shows the generic no-client message when the base URL is invalid but non-empty', async () => {
    const view = render(
      createElement(
        ApparatusProvider,
        { defaultUrl: 'not-a-url', children: createElement(ProviderProbe) }
      )
    );

    await waitFor(() => {
      expect(view.getByTestId('base-url').textContent).toBe('not-a-url');
      expect(view.getByTestId('health-message').textContent).toBe('No client configured');
    });
  });

  it('normalizes setBaseUrl updates before persisting them', async () => {
    const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    const fakeStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: fakeStorage,
    });

    try {
      const view = render(
        createElement(
          ApparatusProvider,
          { defaultUrl: 'http://127.0.0.1:18090', children: createElement(ProviderSetter, { nextUrl: 'http://host.test:9090/some/path/' }) }
        )
      );

      await waitFor(() => {
        expect(view.getByTestId('base-url').textContent).toBe('http://host.test:9090');
      });

      expect(fakeStorage.setItem).toHaveBeenCalledWith('apparatus-base-url', 'http://host.test:9090');
    } finally {
      if (localStorageDescriptor) {
        Object.defineProperty(window, 'localStorage', localStorageDescriptor);
      } else {
        Reflect.deleteProperty(window, 'localStorage');
      }
    }
  });
});
