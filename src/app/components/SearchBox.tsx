interface SearchBoxProps {
  searchQuery: string;
  onSearchQueryChange: (searchQuery: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  onSearchQueryChange,
}) => {
  return (
    <div className="flex-1">
      <label
        htmlFor="search"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Search Token
      </label>
      <input
        type="text"
        id="search"
        placeholder="Search by token name"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );
};

export default SearchBox;
