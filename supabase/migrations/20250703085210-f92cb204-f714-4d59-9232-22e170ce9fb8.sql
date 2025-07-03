-- Forzar la conversión quitando las comillas de la string
UPDATE conversations 
SET client = jsonb_build_object(
    'type', 'phone',
    'value', '+' || substring(trim(both '"' from client::text), 1, 2) || ' ' || substring(trim(both '"' from client::text), 3)
)
WHERE channel = 'Whatsapp' 
AND jsonb_typeof(client) = 'string'
AND trim(both '"' from client::text) ~ '^[0-9]+$' 
AND length(trim(both '"' from client::text)) >= 11;