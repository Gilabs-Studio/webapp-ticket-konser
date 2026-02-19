"use client";

import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

export function useValidateRole() {
  // Minimal stub: ensure hook exists for layouts that call it.
  const { user } = useAuthStore();
  useEffect(() => {
    // No-op currently: placeholder for role validation side-effects
    void user;
  }, [user]);
}

export default useValidateRole;
