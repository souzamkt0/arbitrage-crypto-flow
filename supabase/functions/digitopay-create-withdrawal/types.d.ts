// Declarações de tipos para Deno e Supabase Edge Functions

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  
  export const env: Env;
  
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(url: string, key: string): any;
}

declare module '../_shared/cors.ts' {
  export const corsHeaders: Record<string, string>;
}