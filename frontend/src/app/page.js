export default function DashboardPage() {

  return (

    <div className="min-h-screen flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/5 border-r border-white/10 backdrop-blur-lg p-6">

        <h1 className="text-3xl font-bold text-white mb-10">
          SentinelAI
        </h1>

        <nav className="space-y-4">

          <div className="text-white/80 hover:text-white cursor-pointer transition">
            Dashboard
          </div>

          <div className="text-white/80 hover:text-white cursor-pointer transition">
            Threat Logs
          </div>

          <div className="text-white/80 hover:text-white cursor-pointer transition">
            Analytics
          </div>

          <div className="text-white/80 hover:text-white cursor-pointer transition">
            Settings
          </div>

        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">

        {/* TOP HEADER */}
        <div className="flex items-center justify-between mb-10">

          <div>

            <h2 className="text-4xl font-bold text-white">
              Security Dashboard
            </h2>

            <p className="text-white/60 mt-2">
              Real-time threat monitoring system
            </p>

          </div>

          <button className="
            bg-[#A952B9]
            hover:bg-[#C26BD4]
            transition-all
            duration-300
            text-white
            px-6
            py-3
            rounded-xl
            shadow-lg
          ">
            Generate Report
          </button>

        </div>

        {/* CARDS SECTION */}
        <div className="grid grid-cols-3 gap-6">

          <div className="
            bg-white/5
            border border-white/10
            backdrop-blur-lg
            rounded-2xl
            p-6
            shadow-xl
          ">

            <h3 className="text-white/70 mb-2">
              Total Requests
            </h3>

            <p className="text-4xl font-bold text-white">
              0
            </p>

          </div>

          <div className="
            bg-white/5
            border border-white/10
            backdrop-blur-lg
            rounded-2xl
            p-6
            shadow-xl
          ">

            <h3 className="text-white/70 mb-2">
              Threats Detected
            </h3>

            <p className="text-4xl font-bold text-red-400">
              0
            </p>

          </div>

          <div className="
            bg-white/5
            border border-white/10
            backdrop-blur-lg
            rounded-2xl
            p-6
            shadow-xl
          ">

            <h3 className="text-white/70 mb-2">
              System Status
            </h3>

            <p className="text-2xl font-bold text-green-400">
              Protected
            </p>

          </div>

        </div>

      </main>

    </div>

  );

}