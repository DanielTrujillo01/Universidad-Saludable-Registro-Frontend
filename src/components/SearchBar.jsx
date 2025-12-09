import { Search } from 'lucide-react';

export function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        type="text"
        placeholder="Buscar actividad por nombre..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      />
    </div>
  );
}
