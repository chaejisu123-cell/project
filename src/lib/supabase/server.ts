import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * 서버 컴포넌트 / 서버 액션 / 라우트 핸들러에서 사용하는 Supabase 클라이언트.
 * 매 요청마다 새로 생성해야 한다(공유 캐시 금지).
 *
 * 서버 컴포넌트에서는 쿠키를 쓸 수 없어 setAll이 실패할 수 있는데, 이 경우는
 * proxy.ts(구 middleware)가 세션 갱신을 대신 처리하므로 무시해도 된다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트 렌더링 중 호출된 경우 — proxy가 세션 갱신을 담당하므로 무시.
          }
        },
      },
    },
  );
}
