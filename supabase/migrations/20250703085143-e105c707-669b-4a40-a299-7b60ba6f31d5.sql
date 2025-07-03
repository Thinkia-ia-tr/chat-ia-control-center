-- Corregir la normalización del formato de client para strings que contienen solo números
UPDATE conversations 
SET client = jsonb_build_object(
    'type', 'phone',
    'value', '+' || substring(client::text, 1, 2) || ' ' || substring(client::text, 3)
)
WHERE channel = 'Whatsapp' 
AND jsonb_typeof(client) = 'string'
AND client::text ~ '^[0-9]+$' 
AND length(client::text) >= 11;