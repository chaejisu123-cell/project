import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 인증된 사용자를 요구하는 데이터 접근 지점(서버 컴포넌트, 서버 액션)에서 호출한다.
 * proxy.ts가 1차로 막아주지만, "가장 확실한 방어는 데이터에 가까운 곳"이라는
 * 원칙에 따라 액션/페이지에서도 다시 한번 검증한다.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}
