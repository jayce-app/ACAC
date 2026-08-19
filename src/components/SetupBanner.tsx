import { isSupabaseConfigured } from "../lib/supabase";
import { org } from "../data/org";
import "./SetupBanner.css";

export function SetupBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="setup-banner" role="status">
      <strong>Going live:</strong> the public site works now. Member accounts will sync for everyone
      after Supabase is connected. Reply in Cursor with your DBA name, domain, and Supabase keys
      (see <code>GO_LIVE.md</code>). Current preview URL: {org.publicUrl}
    </div>
  );
}
