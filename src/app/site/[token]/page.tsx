import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomerSiteData } from "@/lib/customer-site";
import { StatusBadge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { NoticeList } from "@/components/site/NoticeList";
import { ScheduleTimeline } from "@/components/site/ScheduleTimeline";
import { PhotoGallery } from "@/components/site/PhotoGallery";

// 관리자가 언제든 사진/공정/공지를 업데이트할 수 있으므로 캐시 없이 항상 최신 상태로 렌더링한다.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/site/[token]">,
): Promise<Metadata> {
  const { token } = await props.params;
  const data = await getCustomerSiteData(token);

  if (!data) {
    return { title: "오퍼하우스 현장관리" };
  }

  return { title: `${data.project.name} | 오퍼하우스` };
}

export default async function CustomerSitePage(
  props: PageProps<"/site/[token]">,
) {
  const { token } = await props.params;
  const data = await getCustomerSiteData(token);

  if (!data) {
    notFound();
  }

  const { project, photos, scheduleItems, notices } = data;

  return (
    <div className="min-h-dvh bg-surface pb-16">
      <header className="border-b border-border bg-canvas">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            OFFERHOUSE
          </p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-ink">{project.name}</h1>
              {project.address && (
                <p className="mt-1 text-sm text-ink-muted">{project.address}</p>
              )}
            </div>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-8">
        <Section title="공지사항">
          <NoticeList notices={notices} />
        </Section>

        <Section title="공정표">
          <ScheduleTimeline items={scheduleItems} />
        </Section>

        <Section title="현장 사진">
          <PhotoGallery photos={photos} />
        </Section>
      </main>
    </div>
  );
}
