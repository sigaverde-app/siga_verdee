
-- Enum de papéis
CREATE TYPE public.app_role AS ENUM ('cidadao', 'motorista', 'administrador');

-- Tabela profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tabela user_roles (separada por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função has_role: SECURITY DEFINER evita recursão em RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Função para retornar o papel principal do usuário
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'administrador' THEN 1
    WHEN 'motorista' THEN 2
    WHEN 'cidadao' THEN 3
  END
  LIMIT 1;
$$;

-- Políticas para profiles
CREATE POLICY "Usuários veem o próprio perfil"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Usuários atualizam o próprio perfil"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'administrador'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admin pode inserir perfis"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Admin pode excluir perfis"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'administrador'));

-- Políticas para user_roles
CREATE POLICY "Usuário vê seus papéis"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'administrador'));

-- Trigger: criar profile + papel cidadão ao novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );

  -- Papel padrão: cidadão. Admin promove para motorista/administrador.
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cidadao');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
