
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { ReferralStats } from "@/components/referrals/ReferralStats";
import { ReferralList } from "@/components/referrals/ReferralList";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { useReferralEmails } from "@/hooks/useReferralEmails";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ReferralsPage() {
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1); // Un mes por defecto
  
  const [startDate, setStartDate] = useState<Date>(oneMonthAgo);
  const [endDate, setEndDate] = useState<Date>(now);
  const [selectedReferralType, setSelectedReferralType] = useState<string | null>(null);
  const [availableReferralTypes, setAvailableReferralTypes] = useState<string[]>([]);

  // Fetch available referral types from the database
  useEffect(() => {
    async function fetchReferralTypes() {
      try {
        const { data, error } = await supabase
          .from('referral_types')
          .select('name')
          .order('name');
          
        if (error) {
          console.error("Error fetching referral types:", error);
          return;
        }
        
        // Extract unique referral type names
        if (data) {
          const types = data.map(item => item.name);
          setAvailableReferralTypes(types);
        }
      } catch (err) {
        console.error("Error fetching referral types:", err);
      }
    }
    
    fetchReferralTypes();
  }, []);

  // Use the hook to listen for automatic referral creations
  useReferralEmails();

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Derivaciones</h1>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
          />
        </div>
        
        <Card className="p-6">
          <ReferralStats startDate={startDate} endDate={endDate} />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Listado de derivaciones</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedReferralType || ""}
                onValueChange={(value) => setSelectedReferralType(value === "todos" ? null : value)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {availableReferralTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ReferralList 
            startDate={startDate} 
            endDate={endDate} 
            referralTypeFilter={selectedReferralType}
          />
        </Card>
      </div>
    </Layout>
  );
}
