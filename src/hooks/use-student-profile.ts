import { useEffect, useState } from "react";

const KEY = "student_name";

export function useStudentProfile() {
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem(KEY));
    setReady(true);
  }, []);

  const save = (value: string) => {
    const v = value.trim();
    localStorage.setItem(KEY, v);
    setName(v);
  };
  const clear = () => {
    localStorage.removeItem(KEY);
    setName(null);
  };

  return { name, ready, save, clear };
}
