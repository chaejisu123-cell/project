# 오퍼하우스 현장관리

인테리어 시공사 오퍼하우스를 위한 현장 관리 웹앱. 2단계(고객 페이지) 완료 상태.

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + Auth)
- Tailwind CSS v4

## 시작하기

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 생성한다.
2. `supabase/migrations/0001_init.sql` 내용을 Supabase 대시보드의 **SQL Editor**에 붙여넣고 실행한다.
   (테이블 6개 생성 + RLS 정책까지 한 번에 적용됨)
3. 대시보드의 **Authentication → Users**에서 관리자 계정을 이메일/비밀번호로 직접 생성한다.
   (회원가입 화면은 없음 — 관리자는 대시보드에서만 생성)

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
│  │        └─ [id]/edit/page.tsx # 현장 수정
│  ├─ site/[token]/
│  │  ├─ page.tsx                 # 고객 페이지 (로그인 없음, 읽기 전용)
│  │  └─ not-found.tsx            # 잘못된 토큰일 때 안내 화면
│  └─ actions/                    # 서버 액션 (auth.ts, projects.ts)
├─ components/
│  ├─ admin/                      # 관리자 전용 컴포넌트
│  ├─ site/                       # 고객 페이지 전용 컴포넌트 (사진/공정표/공지)
│  └─ ui/                         # 공통 플랫 디자인 컴포넌트
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts / server.ts / proxy.ts   # 로그인 세션용 클라이언트
│  │  └─ admin.ts                           # service_role 클라이언트 (RLS 우회, 토큰 검증 후에만 사용)
│  ├─ customer-site.ts            # 토큰으로 현장+사진+공정표+공지 조회 (React cache로 중복 조회 방지)
│  ├─ dal.ts                      # 인증 검증 헬퍼 (requireUser)
│  └─ utils/                      # 토큰 생성, 포맷 유틸
└─ proxy.ts                       # /admin 라우트 보호 (Next 16의 middleware 후속 규칙)
```

## 진행 상황

- [x] 1단계: 프로젝트 세팅, DB 스키마, 관리자 로그인, 현장 목록/등록/수정
- [x] 2단계: 고객 페이지(사진 갤러리 / 공정 타임라인 / 공지사항, 토큰 기반 읽기 전용)
- [ ] 3단계: 실행정산 (예산/지출), 관리자용 사진 업로드·공정표 편집·공지사항 작성 화면

## 다음 단계에서 필요한 것

- **관리자 콘텐츠 관리 화면**: 지금은 `photos`/`schedule_items`/`notices` 테이블에 넣을 수단이
  없어서 고객 페이지가 항상 빈 상태로 보인다. 관리자용 업로드/편집 화면이 있어야 실제로 채워진다.
- Supabase **Storage** 버킷 설정 (사진, 영수증 이미지 업로드용) — public 버킷 + 랜덤 경로로
  기본 제안되어 있음 (변경 원하면 알려주세요)
- 실행정산 화면 (예산 항목 설정 / 실집행 지출 입력 / 협력업체별 관리 / 리포트)
