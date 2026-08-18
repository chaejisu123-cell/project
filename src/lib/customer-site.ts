import "server-only";
import { cache } from "react";
import { createAdminClient } from "./supabase/admin";
import type {
  Notice,
  Photo,
  Project,
  ScheduleItem,
} from "./supabase/database.types";

export interface CustomerSiteData {
  project: Project;
  photos: Photo[];
  scheduleItems: ScheduleItem[];
  notices: Notice[];
}

/**
 * 고객 페이지(/site/[token]) 전용 조회 함수.
 * site_token으로 현장을 먼저 찾고, 없으면 null을 반환한다 — 이 시점부터가
 * 곧 "토큰 검증"이며, 이후 관련 데이터만 골라서 내려준다.
 *
 * React의 cache()로 감싸서 같은 요청 안에서 generateMetadata와 페이지
 * 컴포넌트가 각각 호출해도 DB 조회는 한 번만 일어난다.
 */
export const getCustomerSiteData = cache(
  async (token: string): Promise<CustomerSiteData | null> => {
    const supabase = createAdminClient();

    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("site_token", token)
      .maybeSingle();

    if (!project) {
      return null;
    }

    const [photosRes, scheduleRes, noticesRes] = await Promise.all([
      supabase
        .from("photos")
        .select("*")
        .eq("project_id", project.id)
        .order("taken_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("schedule_items")
        .select("*")
        .eq("project_id", project.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("notices")
        .select("*")
        .eq("project_id", project.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    return {
      project,
      photos: photosRes.data ?? [],
      scheduleItems: scheduleRes.data ?? [],
      notices: noticesRes.data ?? [],
    };
  },
);
