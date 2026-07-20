/**
 * PasswordInput — styled password field with animated visibility toggle.
 * Accepts a React Hook Form `register` result object spread into the input.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiEye, HiEyeOff } from 'react-icons/hi';

export default function PasswordInput({
  label,
  name,
  register,     // spread result of useForm().register(...)
  error,
  placeholder = 'Enter password',
  id,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label && (
        <label className="auth-label" htmlFor={id || name}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={id || name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={name === 'confirmPassword' ? 'new-password' : name === 'password' ? 'current-password' : 'off'}
          className={`auth-input${error ? ' error' : ''}`}
          style={{ paddingRight: '48px' }}
          {...register}
        />

        {/* Eye toggle */}
        <motion.button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(v => !v)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: visible ? '#86efac' : '#83a694',
            display: 'flex',
            alignItems: 'center',
            padding: 0,
            transition: 'color 0.2s',
          }}
        >
          {visible ? <HiEye size={19} /> : <HiEyeOff size={19} />}
        </motion.button>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>⚠</span> {error.message}
        </motion.p>
      )}
    </div>
  );
}
