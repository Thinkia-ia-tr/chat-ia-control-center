import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/components/conversations/types";
import { useToast } from "@/components/ui/use-toast";
import { isValid } from "date-fns";

// Define the client object structure to help with type safety
interface ClientData {
  type: string;
  value: string;
}

// Estos son los únicos canales permitidos en la base de datos
const VALID_CHANNELS = ['Web', 'Whatsapp'];

// Función para validar y formatear datos de cliente
const validateClientData = (client: any): ClientData => {
  let clientData: ClientData = { type: 'id', value: 'Sin cliente' };
  
  // Si no hay datos de cliente, devolver valor por defecto
  if (!client) return clientData;
  
  // Convertir string a objeto si es necesario
  if (typeof client === 'string') {
    try {
      clientData = JSON.parse(client) as ClientData;
    } catch (e) {
      clientData = { type: 'id', value: client };
    }
  } 
  // Si ya es un objeto
  else if (typeof client === 'object') {
    const clientObj = client as any;
    
    if (clientObj.value) {
      clientData = { 
        type: clientObj.type || 'id',
        value: clientObj.value.toString() 
      };
    } else if (typeof clientObj === 'object' && Object.keys(clientObj).length > 0) {
      // Intentar obtener cualquier valor del objeto
      const firstKey = Object.keys(clientObj)[0];
      clientData = { 
        type: 'id', 
        value: clientObj[firstKey]?.toString() || 'Sin cliente'
      };
    }
  }
  
  // Validación básica según el tipo, pero el formato ya lo maneja el backend
  if (clientData.type === 'id') {
    // Validar formato UUID para tipo 'id'
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidPattern.test(clientData.value)) {
      console.warn(`Client ID with invalid UUID format: ${clientData.value}`);
      // No generamos uno nuevo aquí, solo devolvemos el valor tal cual
      // El backend se encargará de la validación real
    }
  } 
  else if (clientData.type === 'phone') {
    // Solo verificar que tenga el formato esperado pero no modificarlo
    // ya que el backend se encarga de esto mediante la función validate_client_format
    if (!clientData.value.startsWith('+34 ')) {
      console.warn(`Phone number without expected format: ${clientData.value}`);
    }
  }
  
  return clientData;
};

export function useConversations(startDate?: Date, endDate?: Date) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['conversations', startDate, endDate],
    queryFn: async () => {
      try {
        console.log("Fetching conversations with date range:", startDate, endDate);
        
        // First get conversations
        let conversationsQuery = supabase
          .from('conversations')
          .select('*');
        
        if (startDate && endDate) {
          // Make sure end dates include the full day
          const adjustedEndDate = new Date(endDate);
          adjustedEndDate.setHours(23, 59, 59, 999);
          
          console.log("Using date filters:", startDate.toISOString(), adjustedEndDate.toISOString());
          
          conversationsQuery = conversationsQuery.gte('date', startDate.toISOString())
                               .lte('date', adjustedEndDate.toISOString());
        }
        
        const { data: conversations, error: conversationsError } = await conversationsQuery.order('date', { ascending: false });
        
        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError);
          toast({
            title: "Error",
            description: "No se pudieron cargar las conversaciones",
            variant: "destructive"
          });
          throw conversationsError;
        }
        
        if (!conversations || conversations.length === 0) {
          console.log("No conversations found");
          return [];
        }
        
        // Get message counts for each conversation
        const conversationIds = conversations.map(conv => conv.id);
        const { data: messageCounts, error: messageError } = await supabase
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds);
        
        if (messageError) {
          console.error("Error fetching message counts:", messageError);
          // Continue without message counts if there's an error
        }
        
        // Count messages per conversation
        const messageCountMap = new Map<string, number>();
        if (messageCounts) {
          messageCounts.forEach(msg => {
            const count = messageCountMap.get(msg.conversation_id) || 0;
            messageCountMap.set(msg.conversation_id, count + 1);
          });
        }
        
        console.log("Conversations raw data:", conversations);
        console.log("Message counts:", messageCountMap);
        
        // Transform and normalize the data
        const processedData = conversations.map(item => {
          // Procesar y validar datos del cliente
          const clientData = validateClientData(item.client);
          
          // Normalizar el canal - asegurarse de que esté correctamente manejado
          // y que solo sea uno de los dos valores permitidos: 'Web' o 'Whatsapp'
          let normalizedChannel = item.channel;
          
          // Si el canal no es uno de los permitidos, usar 'Web' por defecto
          if (!VALID_CHANNELS.includes(normalizedChannel)) {
            normalizedChannel = 'Web';
          }
          
          // Process the date properly
          let dateObj;
          try {
            dateObj = new Date(item.date);
            // Validate the date
            if (!isValid(dateObj)) {
              console.warn(`Invalid date found: ${item.date}, using current date instead`);
              dateObj = new Date(); // Fallback to current date
            }
          } catch (e) {
            console.error("Error parsing date:", e);
            dateObj = new Date(); // Fallback to current date
          }
          
          return {
            ...item,
            channel: normalizedChannel, // Usar el canal normalizado
            client: clientData,
            date: dateObj,
            messages: messageCountMap.get(item.id) || 0 // Use actual message count
          };
        }) as Conversation[];
        
        console.log("Processed conversations:", processedData);
        return processedData;
      } catch (error) {
        console.error("Error in useConversations:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar las conversaciones",
          variant: "destructive"
        });
        throw error;
      }
    },
    refetchOnWindowFocus: false
  });
}
