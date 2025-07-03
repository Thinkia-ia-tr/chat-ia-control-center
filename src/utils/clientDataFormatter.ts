import type { ClientData } from "@/types/referral";

/**
 * Formats client data into a consistent structure with proper phone number formatting
 */
export function formatClientData(clientData: any, isWhatsApp: boolean = false): ClientData {
  let client: ClientData = { type: '', value: '' };

  if (!clientData) {
    return isWhatsApp 
      ? { type: 'phone', value: '+34 000000000' }
      : { type: 'id', value: 'Cliente anónimo' };
  }

  // Si es un número directo (como viene de la base de datos)
  if (typeof clientData === 'number') {
    const clientStr = clientData.toString();
    // Si parece un teléfono (más de 9 dígitos), formatearlo
    if (clientStr.length >= 9) {
      // Extraer los primeros 2 dígitos como código de país
      const countryCode = clientStr.substring(0, 2);
      const phoneNumber = clientStr.substring(2);
      client = { type: 'phone', value: `+${countryCode} ${phoneNumber}` };
    } else {
      client = { type: 'id', value: clientStr };
    }
  }
  // Si es un string, intentamos parsearlo como JSON
  else if (typeof clientData === 'string') {
    try {
      client = JSON.parse(clientData);
    } catch (e) {
      // Si no es JSON válido, verificar si es un número
      const numbersOnly = clientData.replace(/[^\d]/g, '');
      if (numbersOnly.length >= 9) {
        const countryCode = numbersOnly.substring(0, 2);
        const phoneNumber = numbersOnly.substring(2);
        client = { type: 'phone', value: `+${countryCode} ${phoneNumber}` };
      } else {
        client = { type: 'unknown', value: clientData };
      }
    }
  } 
  // Si ya es un objeto, lo usamos directamente pero aplicamos formato si es necesario
  else if (typeof clientData === 'object') {
    client = clientData;
    
    // Aplicar formato correcto a teléfonos
    if (client.type === 'phone' && client.value) {
      const numbersOnly = client.value.replace(/[^\d]/g, '');
      if (numbersOnly.length >= 9) {
        const countryCode = numbersOnly.substring(0, 2);
        const phoneNumber = numbersOnly.substring(2);
        client.value = `+${countryCode} ${phoneNumber}`;
      }
    }
  }

  // Para conversaciones de WhatsApp, aseguramos que el tipo sea 'phone'
  if (isWhatsApp && client.type !== 'phone') {
    client.type = 'phone';
    
    // Si no hay un valor de cliente válido, intentar extraer números
    if (!client.value) {
      client.value = '+34 000000000'; // Valor por defecto
    } else {
      const numbersOnly = client.value.replace(/[^\d]/g, '');
      if (numbersOnly.length >= 9) {
        const countryCode = numbersOnly.substring(0, 2);
        const phoneNumber = numbersOnly.substring(2);
        client.value = `+${countryCode} ${phoneNumber}`;
      }
    }
  }

  return client;
}

/**
 * Transforms raw referral data from Supabase into a Referral object
 */
export function transformReferralData(item: any): import("@/types/referral").Referral {
  // Comprobar si es un canal de WhatsApp (case insensitive)
  const isWhatsApp = item.conversations?.channel?.toLowerCase() === 'whatsapp';
  
  // Formatear los datos del cliente
  const client = formatClientData(item.conversations?.client, isWhatsApp);
  
  return {
    id: item.id,
    conversation_id: item.conversation_id,
    conversation_title: item.conversations?.title || 'Sin título',
    conversation_date: item.conversations?.date || item.created_at,
    client_type: client.type || '',
    client_value: client.value || '',
    referral_type: item.referral_types?.name || 'Desconocido',
    created_at: item.created_at,
    notes: item.notes
  };
}