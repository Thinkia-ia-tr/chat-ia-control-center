-- Crear derivaciones para los mensajes existentes que contienen emails
-- Solo para conversaciones del último mes para que aparezcan en la vista

WITH message_matches AS (
  SELECT DISTINCT
    m.conversation_id,
    rt.id as referral_type_id,
    m.timestamp
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  CROSS JOIN referral_types rt
  CROSS JOIN jsonb_array_elements_text(rt.contact_info->'emails') AS email
  WHERE c.date >= '2025-06-01'
  AND m.content ILIKE '%' || email::text || '%'
  AND NOT EXISTS (
    SELECT 1 FROM referrals r 
    WHERE r.conversation_id = m.conversation_id 
    AND r.referral_type_id = rt.id
  )
)
INSERT INTO referrals (conversation_id, referral_type_id, notes, created_at)
SELECT 
  conversation_id,
  referral_type_id,
  'Auto-creada por detección retroactiva de email en mensaje del ' || to_char(timestamp, 'DD/MM/YYYY HH24:MI'),
  NOW()
FROM message_matches;