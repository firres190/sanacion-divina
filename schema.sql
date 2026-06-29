-- Tabla de compradores autorizados
CREATE TABLE compradores (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  santo_id TEXT NOT NULL DEFAULT 'san-rafael',
  fecha_compra TIMESTAMP DEFAULT NOW(),
  fecha_inicio_novena TIMESTAMP DEFAULT NULL,
  dia_actual INTEGER DEFAULT 0,
  dias_completados INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  activo BOOLEAN DEFAULT true,
  hotmart_transaction TEXT
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_compradores_email ON compradores(email);

-- Tabla de notificaciones pendientes ("avísame cuando esté listo")
CREATE TABLE notificaciones_pendientes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  santo_id TEXT NOT NULL,
  dia_solicitado INTEGER,
  fecha_solicitud TIMESTAMP DEFAULT NOW(),
  notificado BOOLEAN DEFAULT false
);
