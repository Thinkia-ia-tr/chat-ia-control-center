
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Referral {
  id: string;
  conversation_id: string;
  conversation_title: string;
  conversation_date: string; // Fecha de la conversación
  client_type: string;
  client_value: string;
  referral_type: string;
  created_at: string;
  notes?: string;
}

export function useReferrals(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['referrals', startDate, endDate],
    queryFn: async () => {
      // Asegurar que hay fechas válidas para la consulta
      if (!startDate || !endDate) {
        const end = new Date();
        const start = new Date(end);
        start.setMonth(start.getMonth() - 1); // Un mes por defecto
        
        startDate = start;
        endDate = end;
      }

      // Ajustar la fecha de fin para incluir todo el día
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      
      console.log("Fetching referrals with date range:", startDate.toISOString(), adjustedEndDate.toISOString());
      
      // Obtener las derivaciones con información de conversaciones y tipos
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          id,
          created_at,
          notes,
          conversation_id,
          referral_types (name),
          conversations (title, client, date, channel)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', adjustedEndDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching referrals:", error);
        throw error;
      }
      
      console.log("Raw referrals data:", data);
      
      // Transformar los datos para tener una estructura más fácil de usar
      const referrals: Referral[] = data.map((item: any) => {
        let client = { type: '', value: '' };
        
        // Comprobar si es un canal de WhatsApp (case insensitive)
        const isWhatsApp = item.conversations?.channel?.toLowerCase() === 'whatsapp';
        
        // Asegurar que el cliente tenga una estructura válida
        if (item.conversations?.client) {
          // Si es un número directo (como viene de la base de datos)
          if (typeof item.conversations.client === 'number') {
            const clientStr = item.conversations.client.toString();
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
          else if (typeof item.conversations.client === 'string') {
            try {
              client = JSON.parse(item.conversations.client);
            } catch (e) {
              // Si no es JSON válido, verificar si es un número
              const numbersOnly = item.conversations.client.replace(/[^\d]/g, '');
              if (numbersOnly.length >= 9) {
                const countryCode = numbersOnly.substring(0, 2);
                const phoneNumber = numbersOnly.substring(2);
                client = { type: 'phone', value: `+${countryCode} ${phoneNumber}` };
              } else {
                client = { type: 'unknown', value: item.conversations.client };
              }
            }
          } 
          // Si ya es un objeto, lo usamos directamente pero aplicamos formato si es necesario
          else if (typeof item.conversations.client === 'object') {
            client = item.conversations.client;
            
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
        
        return {
          id: item.id,
          conversation_id: item.conversation_id,
          conversation_title: item.conversations?.title || 'Sin título',
          conversation_date: item.conversations?.date || item.created_at, // Usamos la fecha de la conversación
          client_type: client.type || '',
          client_value: client.value || '',
          referral_type: item.referral_types?.name || 'Desconocido',
          created_at: item.created_at,
          notes: item.notes
        };
      });
      
      console.log("Processed referrals:", referrals);
      
      return referrals;
    }
  });
}
