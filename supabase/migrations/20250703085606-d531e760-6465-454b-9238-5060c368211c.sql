-- Crear el trigger para detectar emails en mensajes y crear derivaciones automáticamente
-- Este trigger se ejecutará cada vez que se inserte un nuevo mensaje

CREATE OR REPLACE FUNCTION public.check_message_for_referral_email()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  message_content text;
  email_found text;
  matching_referral_type_id text;
  existing_referral boolean;
BEGIN
  -- Get message content from the new message
  message_content := NEW.content;
  
  -- Look for matching emails in referral_types table
  FOR matching_referral_type_id IN 
    SELECT rt.id 
    FROM referral_types rt, 
         jsonb_array_elements_text(rt.contact_info->'emails') AS email
    WHERE message_content ILIKE '%' || email::text || '%'
  LOOP
    -- Check if referral already exists for this conversation
    SELECT EXISTS (
      SELECT 1 
      FROM referrals 
      WHERE conversation_id = NEW.conversation_id 
      AND referral_type_id = matching_referral_type_id
    ) INTO existing_referral;
    
    -- If no referral exists yet, create one
    IF NOT existing_referral THEN
      INSERT INTO referrals (conversation_id, referral_type_id, notes)
      VALUES (NEW.conversation_id, matching_referral_type_id, 
             'Auto-creada por detección de email en mensaje del ' || to_char(NEW.timestamp, 'DD/MM/YYYY HH24:MI'));
      
      RAISE NOTICE 'Created referral for conversation % with referral_type_id % (email match)', 
                  NEW.conversation_id, matching_referral_type_id;
    END IF;
  END LOOP;
  
  -- Always return NEW to allow the original insert to proceed
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_check_message_for_referral_email ON messages;
CREATE TRIGGER trigger_check_message_for_referral_email
  AFTER INSERT ON messages
  FOR EACH ROW 
  EXECUTE FUNCTION public.check_message_for_referral_email();