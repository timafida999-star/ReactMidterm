import { useEffect, useState } from 'react';

export function useAsyncResource(loader) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({
    data: null,
    error: null,
    status: 'loading',
    loader: null,
    revision: -1,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, error: null, status: 'loading', loader, revision }));
    loader(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ data, error: null, status: 'success', loader, revision });
      },
      (error) => {
        if (!controller.signal.aborted)
          setState({ data: null, error, status: 'error', loader, revision });
      },
    );
    return () => controller.abort();
  }, [loader, revision]);

  const pending = state.loader !== loader || state.revision !== revision;
  return {
    ...state,
    status: pending ? 'loading' : state.status,
    retry: () => setRevision((value) => value + 1),
  };
}
