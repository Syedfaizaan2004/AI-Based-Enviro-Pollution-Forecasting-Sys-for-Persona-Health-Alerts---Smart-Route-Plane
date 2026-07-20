/**
 * SearchableDropdown — custom single-select dropdown with live search filter.
 * Designed for React Hook Form's Controller pattern.
 *
 * Usage:
 *   <Controller name="healthIssue" control={control} render={({ field }) => (
 *     <SearchableDropdown value={field.value} onChange={field.onChange} options={OPTIONS} ... />
 *   )} />
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiSearch, HiCheck } from 'react-icons/hi';

export default function SearchableDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
}) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const containerRef          = useRef(null);
  const searchRef             = useRef(null);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const select = opt => {
    onChange(opt);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="auth-label">{label}</label>}

      {/* Trigger */}
      <motion.button
        type="button"
        id={`dd-${label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.99 }}
        style={{
          width: '100%',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 48,
          background: open ? 'rgba(134,239,172,0.075)' : 'rgba(242,252,244,0.055)',
          border: `1px solid ${open ? 'rgba(134,239,172,0.68)' : error ? 'rgba(239,68,68,0.55)' : 'rgba(187,247,208,0.14)'}`,
          borderRadius: 8,
          color: value ? '#edfdf3' : '#688679',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'Poppins, sans-serif',
          transition: 'all 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(134,239,172,0.12)' : 'none',
        }}
      >
        <span>{value || placeholder}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiChevronDown size={18} style={{ color: '#83a694' }} />
        </motion.span>
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0, right: 0,
              background: '#071b14',
              border: '1px solid rgba(187,247,208,0.14)',
              borderRadius: 8,
              overflow: 'hidden',
              zIndex: 100,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Search bar */}
            <div style={{ padding: '10px', borderBottom: '1px solid rgba(187,247,208,0.1)' }}>
              <div style={{ position: 'relative' }}>
                <HiSearch
                  size={14}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#83a694' }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 9px 9px 30px',
                    background: 'rgba(242,252,244,0.055)',
                    border: '1px solid rgba(187,247,208,0.14)',
                    borderRadius: '8px',
                    color: '#edfdf3',
                    fontSize: '13px',
                    fontFamily: 'Poppins, sans-serif',
                    outline: 'none',
                    caretColor: '#86efac',
                  }}
                />
              </div>
            </div>

            {/* Options list */}
            <div style={{ maxHeight: '210px', overflowY: 'auto' }}>
              {filtered.length > 0 ? filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  role="option"
                  aria-selected={value === opt}
                  onClick={() => select(opt)}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: value === opt ? 'rgba(134,239,172,0.12)' : 'transparent',
                    border: 'none',
                    color: value === opt ? '#bbf7d0' : '#d8f3df',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = 'rgba(134,239,172,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = value === opt ? 'rgba(134,239,172,0.12)' : 'transparent'; }}
                >
                  {opt}
                  {value === opt && <HiCheck size={15} />}
                </button>
              )) : (
                <p style={{ padding: '16px', textAlign: 'center', color: '#83a694', fontSize: '13px' }}>
                  No results found
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
          ⚠ {error.message}
        </motion.p>
      )}
    </div>
  );
}
