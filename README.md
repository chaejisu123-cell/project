# 오퍼하우스 현장관리

인테리어 시공사 오퍼하우스를 위한 현장 관리 웹앱. 1단계(기반 구축) 완료 상태.

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
│  ├─ site/[token]/page.tsx       # 고객 페이지 (2단계에서 구현 예정, 현재는 안내문만)
│  └─ actions/                    # 서버 액션 (auth.ts, projects.ts)
├─ components/
│  ├─ admin/                      # 관리자 전용 컴포넌트
│  └─ ui/                         # 공통 플랫 디자인 컴포넌트
├─ lib/
│  ├─ supabase/                   # 브라우저/서버/proxy용 Supabase 클라이언트 + 스키마 타입
│  ├─ dal.ts                      # 인증 검증 헬퍼 (requireUser)
│  └─ utils/                      # 토큰 생성, 포맷 유틸
└─ proxy.ts                       # /admin 라우트 보호 (Next 16의 middleware 후속 규칙)
```

## 진행 상황

- [x] 1단계: 프로젝트 세팅, DB 스키마, 관리자 로그인, 현장 목록/등록/수정
- [ ] 2단계: 고객 페이지(사진/공정표/공지사항), 실행정산

## 다음 단계에서 필요한 것

- Supabase **Storage** 버킷 설정 (사진, 영수증 이미지 업로드용)
- `/site/[token]` 페이지의 실제 데이터 조회 로직 (서버 전용 서비스 롤 키로 토큰 검증 후 조회)
