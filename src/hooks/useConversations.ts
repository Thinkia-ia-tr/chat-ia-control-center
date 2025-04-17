
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/components/conversations/types";

export function useConversations(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['conversations', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('conversations')
        .select('*');
      
      if (startDate && endDate) {
        // Aseguramos que las fechas de fin incluyan todo el día
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        
        query = query.gte('date', startDate.toISOString())
                    .lte('date', adjustedEndDate.toISOString());
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        date: new Date(item.date)
      })) as Conversation[];
    }
  });
}
