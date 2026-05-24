const API_BASE_URL = "http://localhost:5000/api";

export const fetchStats = async () => {

   const response = await fetch(
      `${API_BASE_URL}/stats`
   );

   return response.json();

};