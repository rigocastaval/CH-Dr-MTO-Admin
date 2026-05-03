-- ================================================================
-- SUPABASE — SQL de configuración inicial
-- 
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en supabase.com
-- 2. Clic en "SQL Editor" en el menú izquierdo
-- 3. Pega TODO este contenido y presiona "Run"
-- ================================================================


-- ── TABLA: usuarios ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usuarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  rol        TEXT NOT NULL CHECK (rol IN ('admin','editor','viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── TABLA: camas_hospitalizacion ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.camas_hospitalizacion (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cama        TEXT NOT NULL,
  nombre_paciente    TEXT,
  sexo               TEXT CHECK (sexo IN ('M','F')),
  servicio           TEXT,
  cedula             TEXT,
  tipo_dh            INTEGER,
  gpo_rh             TEXT,
  edad               INTEGER,
  fecha_ingreso      DATE,
  diagnostico        TEXT,
  pendientes         TEXT,
  prealerta          BOOLEAN DEFAULT false,
  ventilador         BOOLEAN DEFAULT false,
  aislado            BOOLEAN DEFAULT false,
  cirugia_pendiente  BOOLEAN DEFAULT false,
  vpo_pendiente      BOOLEAN DEFAULT false,
  material_qx        BOOLEAN DEFAULT false,
  caso_riesgo        BOOLEAN DEFAULT false,
  updated_at         TIMESTAMPTZ DEFAULT now(),
  updated_by         UUID REFERENCES public.usuarios(id)
);

-- ── TABLA: camas_urgencias ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.camas_urgencias (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cama       TEXT NOT NULL,
  nombre_paciente   TEXT,
  sexo              TEXT CHECK (sexo IN ('M','F')),
  cedula            TEXT,
  edad              INTEGER,
  fecha_ingreso     DATE,
  diagnostico       TEXT,
  pendientes        TEXT,
  triaje            TEXT CHECK (triaje IN ('Rojo','Naranja','Amarillo','Verde')),
  ventilador        BOOLEAN DEFAULT false,
  aislado           BOOLEAN DEFAULT false,
  caso_riesgo       BOOLEAN DEFAULT false,
  updated_at        TIMESTAMPTZ DEFAULT now(),
  updated_by        UUID REFERENCES public.usuarios(id)
);


-- ── SEGURIDAD (Row Level Security) ───────────────────────────────
-- Activa RLS para que nadie acceda sin autenticación

ALTER TABLE public.usuarios                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camas_hospitalizacion    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camas_urgencias          ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer su propio perfil
CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (auth.uid() = auth_id);

-- Admin puede ver todos los usuarios
CREATE POLICY "usuarios_select_admin" ON public.usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_id = auth.uid() AND u.rol = 'admin'
    )
  );

-- Admin puede insertar/actualizar/borrar usuarios
CREATE POLICY "usuarios_all_admin" ON public.usuarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_id = auth.uid() AND u.rol = 'admin'
    )
  );

-- Todos los autenticados pueden leer camas
CREATE POLICY "camas_hosp_select" ON public.camas_hospitalizacion
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "camas_urg_select" ON public.camas_urgencias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admin y editor pueden modificar camas
CREATE POLICY "camas_hosp_write" ON public.camas_hospitalizacion
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_id = auth.uid() AND u.rol IN ('admin','editor')
    )
  );

CREATE POLICY "camas_urg_write" ON public.camas_urgencias
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_id = auth.uid() AND u.rol IN ('admin','editor')
    )
  );


-- ── DATOS DE EJEMPLO ─────────────────────────────────────────────
-- Camas de hospitalización (vacías para empezar)
INSERT INTO public.camas_hospitalizacion (numero_cama) VALUES
  ('1'),('2'),('3'),('4'),('5'),
  ('6'),('7'),('8'),('9'),('10'),
  ('11'),('12'),('13');

-- Camas de urgencias (vacías para empezar)
INSERT INTO public.camas_urgencias (numero_cama) VALUES
  ('U1'),('U2'),('U3'),('U4'),
  ('U5'),('U6'),('U7'),('U8');


-- ── FUNCIÓN: auto-actualizar updated_at ──────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hosp_updated
  BEFORE UPDATE ON public.camas_hospitalizacion
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_urg_updated
  BEFORE UPDATE ON public.camas_urgencias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
