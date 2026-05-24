"use client";

import { useEffect, useState } from "react";

import { fetchStats } from "@/services/api";

export default function DashboardPage() {

   const [stats, setStats] = useState(null);

   useEffect(() => {

      const getStats = async () => {

         const data = await fetchStats();

         setStats(data);

      };

      getStats();

   }, []);

   return (

      <div className="p-10">

         <h1 className="text-3xl font-bold mb-6">
            SentinelAI Dashboard
         </h1>

         {stats && (

            <div>

               <p>
                  Total Requests:
                  {stats.totalRequests}
               </p>

               <p>
                  Total Threats:
                  {stats.totalThreats}
               </p>

            </div>

         )}

      </div>

   );

}