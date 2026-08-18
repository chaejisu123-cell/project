import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * service_role 키를 쓰는 관리용 클라이언트. RLS를 완전히 우회한다.
 *
 * 오직 "토큰을 이미 검증한 뒤"에만 사용해야 한다 — 예를 들어 고객 페이지
 * (/site/[token])는 로그인이 없으므로, site_token으로 현장을 먼저 찾은
 * 다음 이 클라이언트로 관련 데이터를 조회하는 식으로 쓴다.
 *
 * 반드시 서버 전용 코드에서만 import 할 것 (server-only가 클라이언트 번들
 * 포함을 막아준다). 세션을 다루지 않으므로 쿠키 연동이 필요 없다.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
