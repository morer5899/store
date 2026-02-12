import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function SearchFilter({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType,
  placeholder = "Search..."
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder={placeholder}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="name">By Name</option>
            <option value="address">By Address</option>
          </select>
        </div>
      </div>
    </div>
  );
}