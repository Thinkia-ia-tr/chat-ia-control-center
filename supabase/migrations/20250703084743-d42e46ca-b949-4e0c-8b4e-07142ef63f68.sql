-- Actualizar referral_types para añadir emails con asteriscos al array emails
-- Esto permitirá detectar tanto el email normal como el email con formato **email**

-- Asesor Comercial
UPDATE referral_types 
SET contact_info = jsonb_set(
    contact_info, 
    '{emails}', 
    '["asesor@behumax.com", "**asesor@behumax.com**"]'::jsonb
)
WHERE name = 'Asesor Comercial';

-- Atención al Cliente  
UPDATE referral_types 
SET contact_info = jsonb_set(
    contact_info, 
    '{emails}', 
    '["clientes@behumax.com", "**clientes@behumax.com**"]'::jsonb
)
WHERE name = 'Atención al Cliente';

-- Soporte Técnico
UPDATE referral_types 
SET contact_info = jsonb_set(
    contact_info, 
    '{emails}', 
    '["sat@behumax.com", "**sat@behumax.com**"]'::jsonb
)
WHERE name = 'Soporte Técnico';

-- Presupuestos
UPDATE referral_types 
SET contact_info = jsonb_set(
    contact_info, 
    '{emails}', 
    '["adolfocontreras@behumax.com", "**adolfocontreras@behumax.com**"]'::jsonb
)
WHERE name = 'Presupuestos';

-- Colaboraciones
UPDATE referral_types 
SET contact_info = jsonb_set(
    contact_info, 
    '{emails}', 
    '["marketing@behumax.com", "**marketing@behumax.com**"]'::jsonb
)
WHERE name = 'Colaboraciones';