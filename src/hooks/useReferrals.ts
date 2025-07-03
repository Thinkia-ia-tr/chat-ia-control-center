
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Referral } from "@/types/referral";
import { transformReferralData } from "@/utils/clientDataFormatter";
import { adjustEndDateForQuery, getDefaultDateRange } from "@/utils/dateHelpers";

export function useReferrals(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['referrals', startDate, endDate],
    queryFn: async () => {
      // Asegurar que hay fechas válidas para la consulta
      let queryStartDate = startDate;
      let queryEndDate = endDate;
      
      if (!queryStartDate || !queryEndDate) {
        const defaultRange = getDefaultDateRange();
        queryStartDate = defaultRange.startDate;
        queryEndDate = defaultRange.endDate;
      }

      // Ajustar la fecha de fin para incluir todo el día
      const adjustedEndDate = adjustEndDateForQuery(queryEndDate);
      
      console.log("Fetching referrals with date range:", queryStartDate.toISOString(), adjustedEndDate.toISOString());
      
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
        .gte('created_at', queryStartDate.toISOString())
        .lte('created_at', adjustedEndDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching referrals:", error);
        throw error;
      }
      
      console.log("Raw referrals data:", data);
      
      // Transformar los datos usando la utilidad
      const referrals: Referral[] = data.map(transformReferralData);
      
      console.log("Processed referrals:", referrals);
      
      return referrals;
    }
  });
}
