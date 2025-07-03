-- 1. Actualizar el conteo de mensajes en todas las conversaciones
UPDATE conversations 
SET messages = (
    SELECT COUNT(*) 
    FROM messages m 
    WHERE m.conversation_id = conversations.id
);

-- 2. Normalizar el formato de client para las conversaciones de Whatsapp que tienen números directos
-- Convertir números directos a formato de objeto JSON
UPDATE conversations 
SET client = jsonb_build_object(
    'type', 'phone',
    'value', CASE 
        WHEN client::text ~ '^[0-9]+$' AND length(client::text) >= 11 THEN 
            '+' || substring(client::text, 1, 2) || ' ' || substring(client::text, 3)
        ELSE client::text
    END
)
WHERE channel = 'Whatsapp' 
AND jsonb_typeof(client) = 'number';

-- 3. Verificar que los triggers estén activos para futuras inserciones
-- (Los triggers ya existen, solo verificamos que estén funcionando)
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('messages', 'conversations')
ORDER BY event_object_table, trigger_name;