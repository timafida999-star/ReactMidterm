import { useEffect, useState } from 'react';

function readRoute() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('/entity/')) {
    try {
      return { page: 'detail', id: decodeURIComponent(hash.slice(8)) };
    } catch {
      return { page: 'archive' };
    }
  }
  return { page: hash === '/saved' ? 'saved' : hash === '/protocol' ? 'protocol' : 'archive' };
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onHashChange = () => {
      if (!['#main-content', '#catalogue'].includes(window.location.hash)) setRoute(readRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}
