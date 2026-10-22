import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsyncResource } from '../hooks/useAsyncResource';

describe('asynchronous resource lifecycle', () => {
  it('ignores a stale completion even if its loader does not support abort', async () => {
    let resolveOld;
    let resolveNew;
    let oldSignal;
    const oldLoader = (signal) => {
      oldSignal = signal;
      return new Promise((resolve) => {
        resolveOld = resolve;
      });
    };
    const newLoader = () =>
      new Promise((resolve) => {
        resolveNew = resolve;
      });
    const { result, rerender } = renderHook(({ loader }) => useAsyncResource(loader), {
      initialProps: { loader: oldLoader },
    });
    rerender({ loader: newLoader });
    expect(oldSignal.aborted).toBe(true);
    await act(async () => resolveNew('current'));
    await act(async () => resolveOld('stale'));
    expect(result.current.data).toBe('current');
    expect(result.current.status).toBe('success');
  });
  it('retries a failed loader and recovers into success', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('Disconnected'))
      .mockResolvedValueOnce('restored');
    const { result } = renderHook(() => useAsyncResource(loader));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toBe('restored'));
  });
  it('aborts on unmount', () => {
    let signal;
    const loader = (current) => {
      signal = current;
      return new Promise(() => {});
    };
    const { unmount } = renderHook(() => useAsyncResource(loader));
    unmount();
    expect(signal.aborted).toBe(true);
  });
});
