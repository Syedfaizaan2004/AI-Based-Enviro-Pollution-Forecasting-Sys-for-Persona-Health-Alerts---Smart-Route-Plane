/**
 * AutocompleteInput — text input with a floating suggestion list.
 * Filters a predefined list of place names as the user types.
 * Designed for the "Place to Visit" field in the Signup form.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbMapPin } from 'react-icons/tb';

const PLACE_SUGGESTIONS = [
  'Connaught Place, Delhi',
  'Gateway of India, Mumbai',
  'Marine Drive, Mumbai',
  'Bandra, Mumbai',
  'MG Road, Bengaluru',
  'Koramangala, Bengaluru',
  'Cyber City, Gurugram',
  'Noida Sector 62, Noida',
  'Anna Nagar, Chennai',
  'Salt Lake City, Kolkata',
  'Charminar, Hyderabad',
  'Banjara Hills, Hyderabad',
  'Civil Lines, Jaipur',
  'HITEC City, Hyderabad',
  'Powai, Mumbai',
  'Whitefield, Bengaluru',
  'Sector 17, Chandigarh',
  'Gomti Nagar, Lucknow',
  'Park Street, Kolkata',
  'Alipore, Kolkata',
];

export default function AutocompleteInput({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder = 'e.g. Connaught Place, Delhi',
  name,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList]       = useState(false);
  const containerRef                  = useRef(null);

  const handleChange = e => {
    const val = e.target.value;
    onChange(val);
    if (val.trim().length > 1) {
      const filtered = PLACE_SUGGESTIONS.filter(p =>
        p.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 7));
      setShowList(filtered.length > 0);
    } else {
      setShowList(false);
    }
  };

  const handleSelect = place => {
    onChange(place);
    setShowList(false);
  };

  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="auth-label" htmlFor={name}>{label}</label>}

      <div style={{ position: 'relative' }}>
        <TbMapPin
          size={16}
          style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#83a694', pointerEvents: 'none' }}
        />
        <input
          id={name}
          type="text"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          className={`auth-input${error ? ' error' : ''}`}
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Suggestions panel */}
      <AnimatePresence>
        {showList && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.13 }}
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              background: '#071b14',
              border: '1px solid rgba(187,247,208,0.14)',
              borderRadius: 8,
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
              listStyle: 'none',
              padding: '6px 0',
              margin: 0,
            }}
          >
            {suggestions.map(place => (
              <li key={place}>
                <button
                  type="button"
                  role="option"
                  onClick={() => handleSelect(place)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#d8f3df',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(134,239,172,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <TbMapPin size={13} style={{ color: '#86efac', flexShrink: 0 }} />
                  {place}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>⚠ {error.message}</p>
      )}
    </div>
  );
}
