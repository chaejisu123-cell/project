import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/supabase/database.types";

/**
 * /admin/projects/[id]/* 하위 페이지들이 공통으로 쓰는 현장 조회.
 * React cache()로 감싸서 같은 요청 안에서는(layout + page 등) DB 조회가 한 번만 일어난다.
 */
export const getProjectOrNotFound = cache(async (id: string): Promise<Project> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return data;
});
