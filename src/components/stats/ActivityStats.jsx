import { useState, useEffect } from "react";
import { 
  Activity, Users, Target, BarChart2, Search, Info, GitBranch, List 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from "recharts";
import { apiRequest } from "../../api/api";
import { fetchActionDetail } from "../../Funtions/FetchFuntions";
import { ActionDetailCard } from "./Modals/ActionDetailCard";

export function ActivityStats({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // --- LÓGICA DE BÚSQUEDA (PRESERVADA) ---
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }
    const searchAct = async () => {
      setIsSearching(true);
      try {
        const resp = await apiRequest("accion", "GET", null, `?search=${searchTerm}`);
        setSearchResults(resp.results || resp);
      } catch (error) {
        console.error("Error buscando acciones", error);
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(searchAct, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!data || !data.kpis || !data.graficas) {
    return <div className="p-6 text-slate-500 animate-pulse">Cargando panorama general...</div>;
  }

  const { kpis, graficas } = data;

  return (
    <div className="p-6 space-y-8">
      {/* --- KPIs --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-slate-900 flex items-center gap-2 text-xl font-bold">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            Panorama General
          </h2>
          <p className="text-slate-500 text-sm">Vista general del panorama de acción.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <KPICard icon={Target} color="rose" label="Acciones" value={kpis.total_acciones} />
          <KPICard icon={Activity} color="indigo" label="Actividades" value={kpis.total_actividades} />
          <KPICard icon={Users} color="purple" label="Participantes" value={kpis.total_participantes} />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* --- BUSCADOR --- */}
      <section className="space-y-4">
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Buscar recurso o actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                {searchResults.map((acc) => (
                  <button
                    key={acc.id_accion}
                    onClick={() => {
                      fetchActionDetail(acc.id_accion).then(setSelectedAction);
                      setSearchTerm("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-slate-700">{acc.nombre}</span>
                    <Info className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {selectedAction && <ActionDetailCard action={selectedAction} onClose={() => setSelectedAction(null)} />}
      </section>

      {/* --- GRÁFICAS UNIFICADAS (BARRAS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* 1. Prioridades */}
        <ChartContainer title="Distribucción de Prioridad" icon={List}>
          <BarChart data={graficas.prioridades}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: '#f8fafc'}} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Bar name="Acciones" dataKey="acciones" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar name="Actividades" dataKey="actividades" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        {/* 2. Estrategias (Antes era Pie, ahora es Bar para consistencia) */}
        <ChartContainer title="Distribución de Estrategias" icon={Target}>
          <BarChart data={graficas.estrategias}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: '#f8fafc'}} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Bar name="Acciones" dataKey="acciones" fill="#ec4899" radius={[4, 4, 0, 0]} />
            <Bar name="Actividades" dataKey="actividades" fill="#fbcfe8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        {/* 3. Líneas Estratégicas */}
        <ChartContainer title="Distribución de Líneas Estratégicas" icon={GitBranch}>
          <BarChart data={graficas.lineas_estrategicas}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" hide />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{fill: '#f8fafc'}} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Bar name="Acciones" dataKey="acciones" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar name="Actividades" dataKey="actividades" fill="#a7f3d0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

      </div>
    </div>
  );
}

// Estilos y Subcomponentes
const tooltipStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  fontSize: '12px'
};

function KPICard({ icon: Icon, color, label, value }) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    rose: "bg-rose-100 text-rose-600",
    purple: "bg-purple-100 text-purple-600"
  };
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[190px]">
      <div className={`p-2 rounded-lg ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ChartContainer({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-[11px] font-black text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-[0.1em]">
        <Icon className="w-4 h-4" /> {title}
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}