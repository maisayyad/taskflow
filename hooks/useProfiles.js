"use client";

import { useEffect, useState } from "react";
import { getProfiles } from "@/services/users";

/**
 * Resolves UIDs to public profiles ({ displayName, email }). Already-loaded UIDs are cached
 * in state so adding one member does not refetch everybody.
 */
export function useProfiles(uids) {
  const [profiles, setProfiles] = useState({});
  const key = [...new Set(uids)].sort().join(",");

  useEffect(() => {
    const wanted = key ? key.split(",") : [];
    const missing = wanted.filter((uid) => !profiles[uid]);
    if (missing.length === 0) return undefined;
    let cancelled = false;
    getProfiles(missing).then((loaded) => {
      if (!cancelled) setProfiles((prev) => ({ ...prev, ...loaded }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const nameOf = (uid) => (uid ? profiles[uid]?.displayName ?? "Loading..." : "Unassigned");
  return { profiles, nameOf };
}
