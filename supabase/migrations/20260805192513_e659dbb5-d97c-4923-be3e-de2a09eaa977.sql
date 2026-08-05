CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.kb_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.kb_entries TO service_role;
ALTER TABLE public.kb_entries ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER kb_entries_updated_at BEFORE UPDATE ON public.kb_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX kb_entries_category_idx ON public.kb_entries (category);

CREATE TABLE public.forwarders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  whatsapp text,
  wechat text,
  facebook text,
  website text,
  city text,
  departure_country text NOT NULL DEFAULT 'Chine',
  air_rate_ar_kg numeric,
  sea_rate_usd_m3 numeric,
  delivery_standard text,
  delivery_express text,
  avg_delay text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  rates_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.forwarders TO service_role;
ALTER TABLE public.forwarders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER forwarders_updated_at BEFORE UPDATE ON public.forwarders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.kb_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  material text,
  dimensions text,
  weight_kg numeric,
  is_fragile boolean NOT NULL DEFAULT false,
  has_battery boolean NOT NULL DEFAULT false,
  is_liquid boolean NOT NULL DEFAULT false,
  transport_advice text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.kb_products TO service_role;
ALTER TABLE public.kb_products ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER kb_products_updated_at BEFORE UPDATE ON public.kb_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX kb_products_name_idx ON public.kb_products (name);

CREATE TABLE public.kb_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  platform text,
  shop_url text,
  status text NOT NULL DEFAULT 'fiable',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.kb_suppliers TO service_role;
ALTER TABLE public.kb_suppliers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER kb_suppliers_updated_at BEFORE UPDATE ON public.kb_suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  title text NOT NULL DEFAULT 'Nouvelle discussion',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ai_conversations_student_idx ON public.ai_conversations (student_name);

CREATE TABLE public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_messages TO service_role;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_messages_conversation_idx ON public.ai_messages (conversation_id, created_at);