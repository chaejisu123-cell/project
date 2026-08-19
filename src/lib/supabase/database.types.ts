/**
 * 수동으로 작성한 Supabase 스키마 타입.
 *
 * 나중에 Supabase CLI로 실제 스키마와 동기화하려면 프로젝트 연결 후:
 *   npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/database.types.ts
 * 를 실행해서 이 파일을 덮어쓰면 된다. 지금은 supabase/migrations/0001_init.sql 과
 * 1:1로 맞춰 수동 작성했다.
 *
 * Relationships/Views/Functions/Enums/CompositeTypes는 supabase-js가 요구하는
 * 제네릭 스키마 형태를 맞추기 위한 자리표시자다(실제 FK 관계 타입 추론은 하지 않음).
 */

export type ProjectStatus = "진행중" | "완료" | "보류";
export type ScheduleStatus = "예정" | "진행중" | "완료";
export type MaterialRecordType = "사용" | "발주";

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          customer_name: string | null;
          site_token: string;
          budget_total: number;
          status: ProjectStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          customer_name?: string | null;
          site_token: string;
          budget_total?: number;
          status?: ProjectStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          customer_name?: string | null;
          site_token?: string;
          budget_total?: number;
          status?: ProjectStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          taken_at: string | null;
          process_tag: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          taken_at?: string | null;
          process_tag?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          taken_at?: string | null;
          process_tag?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      schedule_items: {
        Row: {
          id: string;
          project_id: string;
          process_name: string;
          start_date: string | null;
          end_date: string | null;
          status: ScheduleStatus;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          process_name: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: ScheduleStatus;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          process_name?: string;
          start_date?: string | null;
          end_date?: string | null;
          status?: ScheduleStatus;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schedule_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notices: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          content: string | null;
          is_pinned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          content?: string | null;
          is_pinned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          content?: string | null;
          is_pinned?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notices_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      budget_items: {
        Row: {
          id: string;
          project_id: string;
          category: string | null;
          item_name: string;
          planned_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          category?: string | null;
          item_name: string;
          planned_amount?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          category?: string | null;
          item_name?: string;
          planned_amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      expense_items: {
        Row: {
          id: string;
          project_id: string;
          budget_item_id: string | null;
          vendor_name: string | null;
          amount: number;
          expense_date: string | null;
          receipt_image_url: string | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          budget_item_id?: string | null;
          vendor_name?: string | null;
          amount?: number;
          expense_date?: string | null;
          receipt_image_url?: string | null;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          budget_item_id?: string | null;
          vendor_name?: string | null;
          amount?: number;
          expense_date?: string | null;
          receipt_image_url?: string | null;
          memo?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expense_items_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_items_budget_item_id_fkey";
            columns: ["budget_item_id"];
            isOneToOne: false;
            referencedRelation: "budget_items";
            referencedColumns: ["id"];
          },
        ];
      };
      labor_records: {
        Row: {
          id: string;
          project_id: string;
          work_date: string;
          process_name: string;
          worker_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          work_date: string;
          process_name: string;
          worker_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          work_date?: string;
          process_name?: string;
          worker_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "labor_records_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      material_records: {
        Row: {
          id: string;
          project_id: string;
          material_name: string;
          unit: string | null;
          record_date: string;
          quantity: number;
          type: MaterialRecordType;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          material_name: string;
          unit?: string | null;
          record_date: string;
          quantity?: number;
          type: MaterialRecordType;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          material_name?: string;
          unit?: string | null;
          record_date?: string;
          quantity?: number;
          type?: MaterialRecordType;
          memo?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "material_records_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Photo = Database["public"]["Tables"]["photos"]["Row"];
export type ScheduleItem = Database["public"]["Tables"]["schedule_items"]["Row"];
export type Notice = Database["public"]["Tables"]["notices"]["Row"];
export type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"];
export type ExpenseItem = Database["public"]["Tables"]["expense_items"]["Row"];
export type LaborRecord = Database["public"]["Tables"]["labor_records"]["Row"];
export type MaterialRecord =
  Database["public"]["Tables"]["material_records"]["Row"];
