// Auto-generated from Supabase via MCP `generate_typescript_types`.
// Run `mcp generate_typescript_types --project xhozkppqpkfhnsmyztsr` and paste the output here.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability_blocks: {
        Row: {
          created_at: string
          end_date: string
          ical_event_id: string | null
          id: string
          property_id: string
          reason: string | null
          reservation_id: string | null
          source: Database["public"]["Enums"]["availability_source"]
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          ical_event_id?: string | null
          id?: string
          property_id: string
          reason?: string | null
          reservation_id?: string | null
          source: Database["public"]["Enums"]["availability_source"]
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          ical_event_id?: string | null
          id?: string
          property_id?: string
          reason?: string | null
          reservation_id?: string | null
          source?: Database["public"]["Enums"]["availability_source"]
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_blocks_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_requests: {
        Row: {
          created_at: string
          id: string
          last_name: string
          reservation_code: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_note: string | null
          status: Database["public"]["Enums"]["claim_request_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_name: string
          reservation_code: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["claim_request_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_name?: string
          reservation_code?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["claim_request_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "claim_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      experiences: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          partner_id: string | null
          points_cost: number
          region: string | null
          stock: number | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          partner_id?: string | null
          points_cost: number
          region?: string | null
          stock?: number | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          partner_id?: string | null
          points_cost?: number
          region?: string | null
          stock?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      host_applications: {
        Row: {
          about: string | null
          contact_email: string
          contact_name: string
          created_at: string
          description: string
          display_name: string
          host_id: string | null
          id: string
          location: string
          phone: string | null
          property_name: string
          property_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["host_application_status"]
        }
        Insert: {
          about?: string | null
          contact_email: string
          contact_name: string
          created_at?: string
          description: string
          display_name: string
          host_id?: string | null
          id?: string
          location: string
          phone?: string | null
          property_name: string
          property_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["host_application_status"]
        }
        Update: {
          about?: string | null
          contact_email?: string
          contact_name?: string
          created_at?: string
          description?: string
          display_name?: string
          host_id?: string | null
          id?: string
          location?: string
          phone?: string | null
          property_name?: string
          property_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["host_application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "host_applications_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      hosts: {
        Row: {
          abn: string | null
          approved_at: string | null
          contact_email: string
          created_at: string
          display_name: string
          id: string
          legal_name: string | null
          onboarding_status: Database["public"]["Enums"]["host_onboarding_status"]
          phone: string | null
          stripe_connect_account_id: string | null
        }
        Insert: {
          abn?: string | null
          approved_at?: string | null
          contact_email: string
          created_at?: string
          display_name: string
          id?: string
          legal_name?: string | null
          onboarding_status?: Database["public"]["Enums"]["host_onboarding_status"]
          phone?: string | null
          stripe_connect_account_id?: string | null
        }
        Update: {
          abn?: string | null
          approved_at?: string | null
          contact_email?: string
          created_at?: string
          display_name?: string
          id?: string
          legal_name?: string | null
          onboarding_status?: Database["public"]["Enums"]["host_onboarding_status"]
          phone?: string | null
          stripe_connect_account_id?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string | null
          cta_url: string | null
          description: string | null
          ends_at: string | null
          featured: boolean
          id: string
          image_url: string | null
          starts_at: string | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          starts_at?: string | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          starts_at?: string | null
          title?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          active: boolean
          contact_email: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          website: string | null
        }
        Insert: {
          active?: boolean
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean
          contact_email?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount_cents: number
          created_at: string
          failure_reason: string | null
          host_id: string
          id: string
          paid_at: string | null
          reservation_id: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          failure_reason?: string | null
          host_id: string
          id?: string
          paid_at?: string | null
          reservation_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          failure_reason?: string | null
          host_id?: string
          id?: string
          paid_at?: string | null
          reservation_id?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          amount: number
          created_at: string
          event: Database["public"]["Enums"]["points_event"]
          id: string
          note: string | null
          redemption_id: string | null
          reservation_id: string | null
          stay_claim_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          event: Database["public"]["Enums"]["points_event"]
          id?: string
          note?: string | null
          redemption_id?: string | null
          reservation_id?: string | null
          stay_claim_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          event?: Database["public"]["Enums"]["points_event"]
          id?: string
          note?: string | null
          redemption_id?: string | null
          reservation_id?: string | null
          stay_claim_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "redemptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_stay_claim_id_fkey"
            columns: ["stay_claim_id"]
            isOneToOne: false
            referencedRelation: "stay_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          host_id: string | null
          id: string
          last_name: string | null
          marketing_opt_in: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          host_id?: string | null
          id: string
          last_name?: string | null
          marketing_opt_in?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          host_id?: string | null
          id?: string
          last_name?: string | null
          marketing_opt_in?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          active: boolean
          address: string | null
          amenities: string[]
          base_rate_cents: number | null
          bathrooms: number | null
          bedrooms: number | null
          cancellation_policy:
            | Database["public"]["Enums"]["cancellation_policy"]
            | null
          check_in_time: string | null
          check_out_time: string | null
          city: string | null
          cleaning_fee_cents: number | null
          country: string | null
          created_at: string
          description: string | null
          headline: string | null
          host_id: string | null
          house_rules: string | null
          id: string
          latitude: number | null
          listing_status: Database["public"]["Enums"]["listing_status"]
          longitude: number | null
          max_guests: number | null
          min_nights: number | null
          name: string
          property_type: Database["public"]["Enums"]["property_type"] | null
          published_at: string | null
          region: string | null
          slug: string | null
          state: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          amenities?: string[]
          base_rate_cents?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cancellation_policy?:
            | Database["public"]["Enums"]["cancellation_policy"]
            | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          cleaning_fee_cents?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          headline?: string | null
          host_id?: string | null
          house_rules?: string | null
          id?: string
          latitude?: number | null
          listing_status?: Database["public"]["Enums"]["listing_status"]
          longitude?: number | null
          max_guests?: number | null
          min_nights?: number | null
          name: string
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          region?: string | null
          slug?: string | null
          state?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          amenities?: string[]
          base_rate_cents?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          cancellation_policy?:
            | Database["public"]["Enums"]["cancellation_policy"]
            | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          cleaning_fee_cents?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          headline?: string | null
          host_id?: string | null
          house_rules?: string | null
          id?: string
          latitude?: number | null
          listing_status?: Database["public"]["Enums"]["listing_status"]
          longitude?: number | null
          max_guests?: number | null
          min_nights?: number | null
          name?: string
          property_type?: Database["public"]["Enums"]["property_type"] | null
          published_at?: string | null
          region?: string | null
          slug?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_hero: boolean
          property_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_hero?: boolean
          property_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_hero?: boolean
          property_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_plans: {
        Row: {
          created_at: string
          end_date: string
          id: string
          min_nights: number | null
          name: string
          nightly_rate_cents: number
          property_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          min_nights?: number | null
          name: string
          nightly_rate_cents: number
          property_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          min_nights?: number | null
          name?: string
          nightly_rate_cents?: number
          property_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_plans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          confirmation_code: string
          created_at: string
          experience_id: string
          id: string
          points_spent: number
          status: Database["public"]["Enums"]["redemption_status"]
          used_at: string | null
          user_id: string
        }
        Insert: {
          confirmation_code?: string
          created_at?: string
          experience_id: string
          id?: string
          points_spent: number
          status?: Database["public"]["Enums"]["redemption_status"]
          used_at?: string | null
          user_id: string
        }
        Update: {
          confirmation_code?: string
          created_at?: string
          experience_id?: string
          id?: string
          points_spent?: number
          status?: Database["public"]["Enums"]["redemption_status"]
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reservations: {
        Row: {
          accommodation_cents: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in: string
          check_out: string
          cleaning_fee_cents: number | null
          code: string
          completed_at: string | null
          created_at: string
          currency: string | null
          guest_email: string
          guest_name: string | null
          host_id: string | null
          host_payout_cents: number | null
          id: string
          nights: number | null
          num_guests: number | null
          platform_fee_cents: number | null
          points_applied: number
          points_discount_cents: number
          property_id: string | null
          source: Database["public"]["Enums"]["reservation_source"]
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          stripe_payment_intent_id: string | null
          total_charged_cents: number | null
          total_value_cents: number
          user_id: string | null
        }
        Insert: {
          accommodation_cents?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in: string
          check_out: string
          cleaning_fee_cents?: number | null
          code: string
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          guest_email: string
          guest_name?: string | null
          host_id?: string | null
          host_payout_cents?: number | null
          id?: string
          nights?: number | null
          num_guests?: number | null
          platform_fee_cents?: number | null
          points_applied?: number
          points_discount_cents?: number
          property_id?: string | null
          source?: Database["public"]["Enums"]["reservation_source"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          stripe_payment_intent_id?: string | null
          total_charged_cents?: number | null
          total_value_cents: number
          user_id?: string | null
        }
        Update: {
          accommodation_cents?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in?: string
          check_out?: string
          cleaning_fee_cents?: number | null
          code?: string
          completed_at?: string | null
          created_at?: string
          currency?: string | null
          guest_email?: string
          guest_name?: string | null
          host_id?: string | null
          host_payout_cents?: number | null
          id?: string
          nights?: number | null
          num_guests?: number | null
          platform_fee_cents?: number | null
          points_applied?: number
          points_discount_cents?: number
          property_id?: string | null
          source?: Database["public"]["Enums"]["reservation_source"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          stripe_payment_intent_id?: string | null
          total_charged_cents?: number | null
          total_value_cents?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          published: boolean
          rating: number
          reservation_id: string
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          published?: boolean
          rating: number
          reservation_id: string
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          published?: boolean
          rating?: number
          reservation_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_claims: {
        Row: {
          claimed_at: string
          id: string
          points_awarded: number
          reservation_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          points_awarded: number
          reservation_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          points_awarded?: number
          reservation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_claims_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: true
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payload: Json
          processed?: boolean
          processed_at?: string | null
          type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_admin_daily_claims: {
        Row: {
          count: number | null
          day: string | null
          points_awarded: number | null
        }
        Relationships: []
      }
      v_admin_daily_redemptions: {
        Row: {
          count: number | null
          day: string | null
          points_spent: number | null
        }
        Relationships: []
      }
      v_admin_daily_signups: {
        Row: {
          count: number | null
          day: string | null
        }
        Relationships: []
      }
      v_user_points: {
        Row: {
          balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_host_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_host_of: { Args: { p_property_id: string }; Returns: boolean }
    }
    Enums: {
      availability_source: "ical" | "manual" | "platform_booking"
      cancellation_policy: "flexible" | "moderate" | "strict"
      claim_request_status: "pending" | "approved" | "rejected"
      host_application_status:
        | "submitted"
        | "reviewing"
        | "approved"
        | "rejected"
        | "withdrawn"
      host_onboarding_status:
        | "invited"
        | "submitted"
        | "approved"
        | "rejected"
        | "paused"
      listing_status:
        | "draft"
        | "pending_review"
        | "published"
        | "paused"
        | "archived"
      payout_status: "scheduled" | "paid" | "failed" | "cancelled"
      points_event:
        | "earn_stay"
        | "spend_redemption"
        | "admin_adjust"
        | "spend_booking"
      property_type:
        | "villa"
        | "beach_house"
        | "apartment"
        | "chalet"
        | "farm_stay"
        | "cottage"
        | "penthouse"
        | "other"
      redemption_status: "pending" | "confirmed" | "used" | "cancelled"
      reservation_source: "guesty_import" | "platform_booking" | "manual_admin"
      reservation_status:
        | "pending_payment"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "refunded"
      user_role: "guest" | "admin" | "host"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_source: ["ical", "manual", "platform_booking"],
      cancellation_policy: ["flexible", "moderate", "strict"],
      claim_request_status: ["pending", "approved", "rejected"],
      host_application_status: [
        "submitted",
        "reviewing",
        "approved",
        "rejected",
        "withdrawn",
      ],
      host_onboarding_status: [
        "invited",
        "submitted",
        "approved",
        "rejected",
        "paused",
      ],
      listing_status: [
        "draft",
        "pending_review",
        "published",
        "paused",
        "archived",
      ],
      payout_status: ["scheduled", "paid", "failed", "cancelled"],
      points_event: [
        "earn_stay",
        "spend_redemption",
        "admin_adjust",
        "spend_booking",
      ],
      property_type: [
        "villa",
        "beach_house",
        "apartment",
        "chalet",
        "farm_stay",
        "cottage",
        "penthouse",
        "other",
      ],
      redemption_status: ["pending", "confirmed", "used", "cancelled"],
      reservation_source: ["guesty_import", "platform_booking", "manual_admin"],
      reservation_status: [
        "pending_payment",
        "confirmed",
        "cancelled",
        "completed",
        "refunded",
      ],
      user_role: ["guest", "admin", "host"],
    },
  },
} as const
