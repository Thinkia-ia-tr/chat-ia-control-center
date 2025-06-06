
import React, { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Stats } from "@/components/dashboard/Stats";
import { RecentConversations } from "@/components/dashboard/RecentConversations";
import Layout from "@/components/layout/Layout";

export function Dashboard() {
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1); // Un mes por defecto
  
  const [startDate, setStartDate] = useState<Date>(oneMonthAgo);
  const [endDate, setEndDate] = useState<Date>(now);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
          />
        </div>

        <Stats startDate={startDate} endDate={endDate} />
        <RecentConversations startDate={startDate} endDate={endDate} />
      </div>
    </Layout>
  );
}

export default Dashboard;
