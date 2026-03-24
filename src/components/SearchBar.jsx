import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCitySuggestions } from '../services/api';

const SearchBar = ({ onSearch, searchHistory, onHistorySelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setSugLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (val) => {
    if (val.length < 2) { setSuggestions([]); return; }
    setSugLoading(true);
    try {
      const data = await fetchCitySuggestions(val);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSugLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowDropdown(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (sug) => {
    const cityName = sug.state ? `${sug.name}, ${sug.state}, ${sug.country}` : `${sug.name}, ${sug.country}`;
    onSearch(sug.name);
    setQuery('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    const items = suggestions.length ? suggestions : searchHistory;
    if (e.key === 'ArrowDown') { setActiveIndex(i => Math.min(i + 1, items.length - 1)); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setActiveIndex(i => Math.max(i - 1, -1)); e.preventDefault(); }
    else if (e.key === 'Enter' && activeIndex >= 0) {
      if (suggestions.length) handleSuggestionClick(suggestions[activeIndex]);
      else { onHistorySelect(items[activeIndex]); setQuery(''); setShowDropdown(false); }
      setActiveIndex(-1);
    } else if (e.key === 'Escape') setShowDropdown(false);
  };

  const showHistory = !query && searchHistory.length > 0 && showDropdown;
  const showSuggestions = query.length >= 2 && showDropdown;

  return (
    <div className="search-wrapper">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-container">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            id="city-search"
            type="text"
            className="search-input"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setActiveIndex(-1); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {query && (
            <button type="button" className="clear-btn" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}>✕</button>
          )}
          <button type="submit" className="search-btn">
            <span>Search</span>
          </button>
        </div>
      </form>

      {(showSuggestions || showHistory) && (
        <div className="search-dropdown" ref={dropdownRef}>
          {showHistory && (
            <>
              <div className="dropdown-section-title">🕘 Recent Searches</div>
              {searchHistory.map((city, i) => (
                <div
                  key={city}
                  className={`dropdown-item ${activeIndex === i ? 'active' : ''}`}
                  onClick={() => { onHistorySelect(city); setShowDropdown(false); }}
                >
                  <span className="dropdown-icon">📍</span>
                  <span>{city}</span>
                </div>
              ))}
            </>
          )}
          {showSuggestions && (
            <>
              {loading ? (
                <div className="dropdown-item loading-item">
                  <span className="mini-spinner"></span> Searching cities...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((sug, i) => (
                  <div
                    key={`${sug.name}-${sug.lat}`}
                    className={`dropdown-item ${activeIndex === i ? 'active' : ''}`}
                    onClick={() => handleSuggestionClick(sug)}
                  >
                    <span className="dropdown-icon">🌍</span>
                    <div>
                      <div className="sug-city">{sug.name}</div>
                      <div className="sug-sub">{sug.state ? `${sug.state}, ` : ''}{sug.country}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dropdown-item no-results">No cities found for "{query}"</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
