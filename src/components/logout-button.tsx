"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors — local session/cookies are cleared regardless.
    }
    // Hard navigation guarantees a fresh server render and avoids the browser
    // back/forward cache redisplaying authenticated pages after logout.
    window.location.href = "/login";
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? "Logging out…" : "Log out"}
    </Button>
  );
}
