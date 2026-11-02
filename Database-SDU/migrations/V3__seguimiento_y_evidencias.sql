ALTER TABLE denuncias
    ADD COLUMN IF NOT EXISTS codigo_seguimiento VARCHAR(12),
    ADD COLUMN IF NOT EXISTS evidencias_url TEXT;

UPDATE denuncias
SET codigo_seguimiento = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
WHERE codigo_seguimiento IS NULL OR btrim(codigo_seguimiento) = '';

ALTER TABLE denuncias
    ALTER COLUMN codigo_seguimiento SET NOT NULL,
    ADD CONSTRAINT uq_denuncias_codigo_seguimiento UNIQUE (codigo_seguimiento);
