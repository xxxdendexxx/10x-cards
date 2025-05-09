/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: {
        id: string;
        email?: string;
        // Add other fields if necessary
      };
      runtime: {
        env: {
          SUPABASE_URL: string;
          SUPABASE_KEY: string;
          OPENROUTER_API_KEY: string;
          TestUsername: string;
          TestPassword: string;
          // Add other Cloudflare environment variables here if needed
          // Naprzykład, jeśli masz inne bindowania lub zmienne
          // MY_KV_NAMESPACE: KVNamespace;
          // ANOTHER_VAR: string;
        };
        // Możesz też dodać inne właściwości runtime Cloudflare, jeśli ich używasz
        // np. context.waitUntil, context.next
      };
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly OPENROUTER_ENDPOINT: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
