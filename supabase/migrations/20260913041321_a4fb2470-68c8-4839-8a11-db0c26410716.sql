CREATE TABLE public.student_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL UNIQUE,
  credits_messages integer NOT NULL DEFAULT 0,
  free_used boolean NOT NULL DEFAULT false,
  statut_paiement text NOT NULL DEFAULT 'none',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.student_accounts TO service_role;
ALTER TABLE public.student_accounts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER student_accounts_updated_at BEFORE UPDATE ON public.student_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  number text NOT NULL,
  holder text,
  instructions text,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_methods (label, number, holder, instructions, position)
VALUES ('Mvola', '038 79 097 13', 'Jean Noël', 'Alefaso ny vola dia alao sary ny reçu (capture d''écran).', 0);

CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  plan_id text NOT NULL,
  messages integer NOT NULL,
  amount_ar integer NOT NULL,
  proof_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payment_requests_status_idx ON public.payment_requests (status, created_at DESC);
CREATE INDEX payment_requests_student_idx ON public.payment_requests (student_name, created_at DESC);
GRANT ALL ON public.payment_requests TO service_role;
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER payment_requests_updated_at BEFORE UPDATE ON public.payment_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.consume_message_credit(p_student text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acc public.student_accounts%ROWTYPE;
BEGIN
  INSERT INTO public.student_accounts (student_name) VALUES (p_student)
  ON CONFLICT (student_name) DO NOTHING;

  SELECT * INTO acc FROM public.student_accounts WHERE student_name = p_student FOR UPDATE;

  IF NOT acc.free_used THEN
    UPDATE public.student_accounts SET free_used = true WHERE id = acc.id;
    RETURN 'free';
  ELSIF acc.credits_messages > 0 THEN
    UPDATE public.student_accounts SET credits_messages = credits_messages - 1 WHERE id = acc.id;
    RETURN 'credit';
  ELSE
    RETURN 'blocked';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_message_credit(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_message_credit(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_message_credit(text) TO service_role;