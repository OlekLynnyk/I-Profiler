// hooks/useUserStats.ts
import { useEffect, useState } from 'react';

export function useUserStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/user/stats');
      const data = await res.json();
      setStats(data);
    }

    fetchStats();
  }, []);

  return stats;
}
