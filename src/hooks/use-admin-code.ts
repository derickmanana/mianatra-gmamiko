import { useEffect, useState } from "react";

const KEY = "admin_code";

export function useAdminCode() {
  const [code, setCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCode(sessionStorage.getItem(KEY));
    setReady(true);
  }, []);

  const save = (value: string) => {
    sessionStorage.setItem(KEY, value);
    setCode(value);
  };
  const clear = () => {
    sessionStorage.removeItem(KEY);
    setCode(null);
  };

  return { code, ready, save, clear };
}
