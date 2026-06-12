import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './icons';

const tags = ['Coworking', 'Virtual Office', 'Meeting Room', 'Private Office', 'Event Space', 'Legalitas'];

export default function QuickSearch() {
  const [activeTag, setActiveTag] = useState('Coworking');
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    let path = '/coworking';
    if (activeTag === 'Legalitas') path = '/bisnis';
    
    navigate(`${path}?search=${encodeURIComponent(searchValue)}`);
  };

  return (
    <div className="container">
      <div className="quicksearch">
        <div className="quicksearch-card">
          <div className="quicksearch-row">
            <label className="qs-field" style={{ flex: 1 }}>
              <span>Cari Produk</span>
              <span className="qs-field-inner">
                <Icon.Search />
                <input 
                  placeholder="Coworking, meeting room, virtual office..." 
                  style={{ width: '100%' }} 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </span>
            </label>
            <button className="qs-search-btn" onClick={handleSearch}>
              <Icon.Search /> Cari
            </button>
          </div>
          <div className="quick-tags">
            <span className="quick-tags-label">Populer</span>
            {tags.map(t => (
              <button
                key={t}
                className={`qtag${activeTag === t ? ' active' : ''}`}
                onClick={() => setActiveTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
