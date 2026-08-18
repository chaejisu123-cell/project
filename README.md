# 오퍼하우스 현장관리

인테리어 시공사 오퍼하우스를 위한 현장 관리 웹앱. 관리자 콘텐츠 관리 기능까지 완료 상태.

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + Auth + Storage)
- Tailwind CSS v4
- @dnd-kit (공정표 드래그 순서 변경)

## 시작하기

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성한다.
2. Supabase 대시보드의 **SQL Editor**에서 아래 두 파일을 **순서대로** 실행한다.
   - `supabase/migrations/0001_init.sql` — 테이블 6개 + RLS 정책
   - `supabase/migrations/0002_storage.sql` — 사진 업로드용 Storage 버킷(`site-photos`) + 정책
3. 대시보드의 **Authentication → Users**에서 관리자 계정을 이메일/비밀번호로 직접 생성한다.
   (회원가입 화면은 없음 — 관리자는 대시보드에서만 생성, "Auto Confirm User" 체크 필수)

### 2. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`로 저장하고, Supabase 대시보드의
**Project Settings → API**에서 값을 채운다.

```bash
cp .env.local.example .env.local
```

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속 시 `/admin`으로 리다이렉트되고,
로그인하지 않았다면 `/admin/login`으로 이동한다.

## 폴더 구조

```
src/
├─ app/
│  ├─ admin/
│  │  ├─ login/page.tsx           # 로그인 (공개)
│  │  └─ (dashboard)/             # 로그인 필요 (layout에서 검증)
│  │     ├─ layout.tsx            # 상단바 + 로그아웃
│  │     ├─ page.tsx              # 현장 목록
│  │     └─ projects/
│  │        ├─ new/page.tsx       # 현장 등록
│  │        └─ [id]/
│  │           ├─ layout.tsx      # 탭 네비게이션 (현장정보/사진/공정표/공지사항)
│  │           ├─ edit/page.tsx   # 현장 정보 수정
│  │           ├─ photos/page.tsx    # 사진 업로드 + 관리
│  │           ├─ schedule/page.tsx  # 공정표 편집 (드래그 순서 변경)
│  │           └─ notices/page.tsx   # 공지사항 작성 + 관리
│  ├─ site/[token]/
│  │  ├─ page.tsx                 # 고객 페이지 (로그인 없음, 읽기 전용)
│  │  └─ not-found.tsx            # 잘못된 토큰일 때 안내 화면
│  └─ actions/                    # 서버 액션 (auth, projects, photos, schedule, notices)
├─ components/
│  ├─ admin/                      # 관리자 전용 컴포넌트 (업로드 폼, 공정표 에디터 등)
│  ├─ site/                       # 고객 페이지 전용 컴포넌트 (사진/공정표/공지)
│  └─ ui/                         # 공통 플랫 디자인 컴포넌트
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts / server.ts / proxy.ts   # 로그인 세션용 클라이언트
│  │  └─ admin.ts                           # service_role 클라이언트 (RLS 우회, 토큰 검증 후에만 사용)
│  ├─ customer-site.ts            # 토큰으로 현장+사진+공정표+공지 조회 (React cache로 중복 조회 방지)
│  ├─ admin-project.ts            # /admin/projects/[id]/* 공통 현장 조회 (React cache)
│  ├─ dal.ts                      # 인증 검증 헬퍼 (requireUser)
│  ├─ constants.ts                # Storage 버킷 이름, 공정 태그 목록
│  └─ utils/                      # 토큰 생성, 이미지 압축, 포맷 유틸
└─ proxy.ts                       # /admin 라우트 보호 (Next 16의 middleware 후속 규칙)
```

## 진행 상황

- [x] 1단계: 프로젝트 세팅, DB 스키마, 관리자 로그인, 현장 목록/등록/수정
- [x] 2단계: 고객 페이지(사진 갤러리 / 공정 타임라인 / 공지사항, 토큰 기반 읽기 전용)
- [x] 3단계: 관리자 콘텐츠 관리 (사진 업로드·압축, 공정표 드래그 편집, 공지사항 작성)
- [ ] 4단계: 실행정산 (예산 항목 설정 / 실집행 지출 입력 / 협력업체별 관리 / 리포트)

## 사진 업로드 동작 방식

- 브라우저에서 canvas로 리사이즈(긴 변 1600px) + JPEG 압축(품질 0.82) 후 Supabase Storage에
  **직접** 업로드한다 (서버를 거치지 않아 Vercel 서버리스 함수 용량 제한을 피함).
- 업로드가 끝나면 결과 URL들을 서버 액션으로 `photos` 테이블에 기록한다.
- 업로드 한 번에 촬영일/공정 태그를 하나씩 지정하는 방식이라, 같은 방문에서 찍은 사진들을
  한꺼번에 올리는 흐름을 가정한다.
- 관리 화면에서는 촬영일 기준으로 날짜별 헤더 아래 그룹핑해서 보여준다.

## 공정표 달력 뷰

- 기존 목록형 입력 화면은 그대로 두고, 같은 페이지 안에 "목록 / 달력" 전환 탭을 추가했다
  (`ScheduleView` → `ScheduleEditor`/`ScheduleCalendar` 중 선택 렌더링).
- 달력은 월 단위 그리드이며, 각 공정이 시작일~종료일 구간에 상태별 색상 막대(완료=초록,
  진행중=테라코타, 예정=외곽선)로 표시된다. 여러 주에 걸친 공정은 주 경계에서 이어지고,
  실제 시작/종료일에서만 끝이 둥글게 처리된다.
- 날짜를 클릭하면 하단에 그날 해당하는 공정 목록이 표시된다.
- 탭을 바꿀 때마다 서버에서 최신 데이터를 다시 받아오므로, 목록에서 편집한 내용이 달력에도
  곧바로 반영된다.

## 다음 단계에서 필요한 것

- 실행정산 화면 (예산 항목 설정 / 실집행 지출 입력 / 협력업체별 관리 / 리포트)
- 영수증 이미지 업로드용 Storage 버킷 (현재 `site-photos`는 현장 사진 전용)
