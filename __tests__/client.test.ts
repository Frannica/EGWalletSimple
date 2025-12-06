import { fetchRates } from '../src/api/client';

describe('api client', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('fetchRates returns parsed rates', async () => {
    const fakeRates = {
      base: 'USD',
      values: { USD: 1, EUR: 0.9 },
      updatedAt: 12345,
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fakeRates),
      } as any)
    );

    const rates = await fetchRates();
    expect(rates).toEqual(fakeRates);
    expect(global.fetch).toHaveBeenCalled();
  });

  test('fetchRates throws on non-ok response', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('server error'),
      } as any)
    );

    await expect(fetchRates()).rejects.toThrow();
  });
});
