export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cache_hits: {
        Row: {
          created_at: string
          request_id: string
        }
        Insert: {
          created_at?: string
          request_id: string
        }
        Update: {
          created_at?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cache_hits_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "request"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cache_hits_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "request_rbac"
            referencedColumns: ["id"]
          }
        ]
      }
      contact_submissions: {
        Row: {
          company_description: string | null
          company_name: string | null
          created_at: string | null
          email_address: string | null
          first_name: string | null
          id: number
          last_name: string | null
          tag: string | null
        }
        Insert: {
          company_description?: string | null
          company_name?: string | null
          created_at?: string | null
          email_address?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          tag?: string | null
        }
        Update: {
          company_description?: string | null
          company_name?: string | null
          created_at?: string | null
          email_address?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          tag?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          feature: string
          id: number
          org_id: string
        }
        Insert: {
          created_at?: string | null
          feature: string
          id?: number
          org_id: string
        }
        Update: {
          created_at?: string | null
          feature?: string
          id?: number
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          rating: boolean
          response_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: boolean
          response_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: boolean
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_response_id_fkey"
            columns: ["response_id"]
            referencedRelation: "response"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_response_id_fkey"
            columns: ["response_id"]
            referencedRelation: "materialized_response_and_request"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "feedback_response_id_fkey"
            columns: ["response_id"]
            referencedRelation: "response_and_request_rbac"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "feedback_response_id_fkey"
            columns: ["response_id"]
            referencedRelation: "response_rbac"
            referencedColumns: ["id"]
          }
        ]
      }
      helicone_api_keys: {
        Row: {
          api_key_hash: string
          api_key_name: string
          created_at: string
          id: number
          organization_id: string
          soft_delete: boolean
          user_id: string
        }
        Insert: {
          api_key_hash: string
          api_key_name: string
          created_at?: string
          id?: number
          organization_id: string
          soft_delete?: boolean
          user_id: string
        }
        Update: {
          api_key_hash?: string
          api_key_name?: string
          created_at?: string
          id?: number
          organization_id?: string
          soft_delete?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helicone_api_keys_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helicone_api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      helicone_proxy_keys: {
        Row: {
          created_at: string | null
          helicone_proxy_key: string
          helicone_proxy_key_name: string
          id: string
          org_id: string
          provider_key_id: string
          soft_delete: boolean
        }
        Insert: {
          created_at?: string | null
          helicone_proxy_key: string
          helicone_proxy_key_name: string
          id?: string
          org_id: string
          provider_key_id: string
          soft_delete?: boolean
        }
        Update: {
          created_at?: string | null
          helicone_proxy_key?: string
          helicone_proxy_key_name?: string
          id?: string
          org_id?: string
          provider_key_id?: string
          soft_delete?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "helicone_proxy_keys_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helicone_proxy_keys_provider_key_id_fkey"
            columns: ["provider_key_id"]
            referencedRelation: "provider_keys"
            referencedColumns: ["id"]
          }
        ]
      }
      layout: {
        Row: {
          columns: Json | null
          created_at: string | null
          filters: Json | null
          id: number
          name: string
          user_id: string
        }
        Insert: {
          columns?: Json | null
          created_at?: string | null
          filters?: Json | null
          id?: number
          name: string
          user_id: string
        }
        Update: {
          columns?: Json | null
          created_at?: string | null
          filters?: Json | null
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "layout_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization: {
        Row: {
          color: string
          created_at: string | null
          has_onboarded: boolean
          icon: string
          id: string
          is_personal: boolean
          name: string
          owner: string
          soft_delete: boolean
        }
        Insert: {
          color?: string
          created_at?: string | null
          has_onboarded?: boolean
          icon?: string
          id?: string
          is_personal?: boolean
          name: string
          owner: string
          soft_delete?: boolean
        }
        Update: {
          color?: string
          created_at?: string | null
          has_onboarded?: boolean
          icon?: string
          id?: string
          is_personal?: boolean
          name?: string
          owner?: string
          soft_delete?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "organization_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_member: {
        Row: {
          created_at: string | null
          member: string
          org_role: string
          organization: string
        }
        Insert: {
          created_at?: string | null
          member: string
          org_role?: string
          organization: string
        }
        Update: {
          created_at?: string | null
          member?: string
          org_role?: string
          organization?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_member_member_fkey"
            columns: ["member"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_member_organization_fkey"
            columns: ["organization"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt: {
        Row: {
          auth_hash: string
          created_at: string | null
          id: string
          name: string
          prompt: string
        }
        Insert: {
          auth_hash: string
          created_at?: string | null
          id: string
          name: string
          prompt: string
        }
        Update: {
          auth_hash?: string
          created_at?: string | null
          id?: string
          name?: string
          prompt?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          auth_hash: string | null
          created_at: string
          id: number
          key: string
          request_id: string | null
          user_id: string | null
          value: string
        }
        Insert: {
          auth_hash?: string | null
          created_at?: string
          id?: number
          key: string
          request_id?: string | null
          user_id?: string | null
          value: string
        }
        Update: {
          auth_hash?: string | null
          created_at?: string
          id?: number
          key?: string
          request_id?: string | null
          user_id?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "request"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "request_rbac"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      provider_keys: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          provider_key_name: string
          provider_name: string
          soft_delete: boolean
          vault_key_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id: string
          provider_key_name: string
          provider_name: string
          soft_delete?: boolean
          vault_key_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          provider_key_name?: string
          provider_name?: string
          soft_delete?: boolean
          vault_key_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_keys_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          }
        ]
      }
      request: {
        Row: {
          auth_hash: string
          body: Json
          created_at: string
          formatted_prompt_id: string | null
          helicone_api_key_id: number | null
          helicone_org_id: string | null
          helicone_proxy_key_id: string | null
          helicone_user: string | null
          id: string
          path: string
          prompt_id: string | null
          prompt_values: Json | null
          properties: Json | null
          provider: string
          user_id: string | null
        }
        Insert: {
          auth_hash: string
          body: Json
          created_at?: string
          formatted_prompt_id?: string | null
          helicone_api_key_id?: number | null
          helicone_org_id?: string | null
          helicone_proxy_key_id?: string | null
          helicone_user?: string | null
          id?: string
          path: string
          prompt_id?: string | null
          prompt_values?: Json | null
          properties?: Json | null
          provider?: string
          user_id?: string | null
        }
        Update: {
          auth_hash?: string
          body?: Json
          created_at?: string
          formatted_prompt_id?: string | null
          helicone_api_key_id?: number | null
          helicone_org_id?: string | null
          helicone_proxy_key_id?: string | null
          helicone_user?: string | null
          id?: string
          path?: string
          prompt_id?: string | null
          prompt_values?: Json | null
          properties?: Json | null
          provider?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_formatted_prompt_id_fkey"
            columns: ["formatted_prompt_id"]
            referencedRelation: "prompt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_helicone_api_key_id_fkey"
            columns: ["helicone_api_key_id"]
            referencedRelation: "helicone_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_helicone_org_id_fkey"
            columns: ["helicone_org_id"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_helicone_proxy_key_id_fkey"
            columns: ["helicone_proxy_key_id"]
            referencedRelation: "helicone_proxy_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_helicone_user_fkey"
            columns: ["helicone_user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      response: {
        Row: {
          body: Json
          completion_tokens: number | null
          created_at: string
          delay_ms: number | null
          feedback: Json | null
          id: string
          prompt_tokens: number | null
          request: string
          status: number | null
        }
        Insert: {
          body: Json
          completion_tokens?: number | null
          created_at?: string
          delay_ms?: number | null
          feedback?: Json | null
          id?: string
          prompt_tokens?: number | null
          request: string
          status?: number | null
        }
        Update: {
          body?: Json
          completion_tokens?: number | null
          created_at?: string
          delay_ms?: number | null
          feedback?: Json | null
          id?: string
          prompt_tokens?: number | null
          request?: string
          status?: number | null
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          api_key_hash: string
          api_key_preview: string
          created_at: string
          key_name: string | null
          user_id: string
        }
        Insert: {
          api_key_hash: string
          api_key_preview: string
          created_at?: string
          key_name?: string | null
          user_id: string
        }
        Update: {
          api_key_hash?: string
          api_key_preview?: string
          created_at?: string
          key_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          request_limit: number
          tier: string
          user: string
        }
        Insert: {
          created_at?: string | null
          request_limit?: number
          tier?: string
          user: string
        }
        Update: {
          created_at?: string | null
          request_limit?: number
          tier?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_fkey"
            columns: ["user"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      webhook_subscriptions: {
        Row: {
          created_at: string | null
          event: string
          id: number
          payload_type: Json
          webhook_id: number
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: number
          payload_type: Json
          webhook_id: number
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: number
          payload_type?: Json
          webhook_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "webhook_subscriptions_webhook_id_fkey"
            columns: ["webhook_id"]
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          }
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          destination: string
          id: number
          is_verified: boolean
          org_id: string
          txt_record: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          id?: number
          is_verified?: boolean
          org_id: string
          txt_record: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          id?: number
          is_verified?: boolean
          org_id?: string
          txt_record?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_org_id_fkey"
            columns: ["org_id"]
            referencedRelation: "organization"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      materialized_response_and_request: {
        Row: {
          is_cached: boolean | null
          prompt_name: string | null
          prompt_regex: string | null
          request_body: Json | null
          request_created_at: string | null
          request_formatted_prompt_id: string | null
          request_id: string | null
          request_path: string | null
          request_prompt_values: Json | null
          request_properties: Json | null
          request_user_id: string | null
          response_body: Json | null
          response_created_at: string | null
          response_id: string | null
          user_api_key_hash: string | null
          user_api_key_preview: string | null
          user_api_key_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_api_key_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      metrics_rbac: {
        Row: {
          average_response_time: number | null
          average_tokens_per_response: number | null
        }
        Relationships: []
      }
      model_metrics: {
        Row: {
          model: string | null
          request_count: number | null
          sum_completion_tokens: number | null
          sum_prompt_tokens: number | null
          sum_tokens: number | null
        }
        Relationships: []
      }
      request_cache_rbac: {
        Row: {
          auth_hash: string | null
          body: Json | null
          cached_created_at: string | null
          created_at: string | null
          formatted_prompt_id: string | null
          id: string | null
          path: string | null
          prompt_id: string | null
          prompt_values: Json | null
          properties: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      request_rbac: {
        Row: {
          auth_hash: string | null
          body: Json | null
          created_at: string | null
          id: string | null
          path: string | null
          properties: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      response_and_request_rbac: {
        Row: {
          api_key_preview: string | null
          formatted_prompt_id: string | null
          is_cached: boolean | null
          prompt_name: string | null
          prompt_regex: string | null
          prompt_values: Json | null
          request_body: Json | null
          request_created_at: string | null
          request_id: string | null
          request_path: string | null
          request_properties: Json | null
          request_user_id: string | null
          response_body: Json | null
          response_created_at: string | null
          response_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      response_rbac: {
        Row: {
          body: Json | null
          created_at: string | null
          id: string | null
          request: string | null
        }
        Relationships: []
      }
      user_metrics_rbac: {
        Row: {
          average_requests_per_day_active: number | null
          average_tokens_per_request: number | null
          first_active: string | null
          last_active: string | null
          total_requests: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_request_access: {
        Args: {
          this_auth_hash: string
          this_user_id: string
        }
        Returns: boolean
      }
      check_response_access:
        | {
            Args: {
              this_associated_request_id: string
              this_user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              this_associated_request_id: string
            }
            Returns: boolean
          }
      date_count:
        | {
            Args: {
              time_increment: string
              prev_period: string
            }
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              time_increment: string
            }
            Returns: Record<string, unknown>[]
          }
      ensure_personal: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_org_id: {
        Args: {
          request_id: string
        }
        Returns: string
      }
      insert_feedback_and_update_response: {
        Args: {
          response_id: string
          feedback_metric_id: number
          boolean_value: boolean
          numerical_value: number
          string_value: string
          categorical_value: string
          created_by: string
          name: string
        }
        Returns: number
      }
      verify_helicone_proxy_key: {
        Args: {
          api_key: string
          stored_hashed_key: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

