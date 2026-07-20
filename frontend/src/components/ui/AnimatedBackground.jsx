/**
 * AnimatedBackground - layered air-flow, terrain bands, and drifting leaves.
 * Used by Login, Signup, Dashboard, and protected loading screens.
 */

import { motion } from 'framer-motion';
import { TbLeaf } from 'react-icons/tb';

const AIR_LINES = [
  { id: 1, top: '14%', left: '-12%', width: '52%', delay: 0.1, dur: 17, opacity: 0.34 },
  { id: 2, top: '31%', left: '18%',  width: '46%', delay: 3.2, dur: 21, opacity: 0.22 },
  { id: 3, top: '58%', left: '-8%',  width: '58%', delay: 1.8, dur: 19, opacity: 0.26 },
  { id: 4, top: '76%', left: '42%',  width: '44%', delay: 5.1, dur: 23, opacity: 0.2  },
];

const LEAVES = [
  { id: 1, left: '8%',  top: '20%', size: 16, delay: 0.4, dur: 18, rotate: -18, color: '#86efac' },
  { id: 2, left: '18%', top: '72%', size: 12, delay: 2.8, dur: 22, rotate: 24,  color: '#5eead4' },
  { id: 3, left: '34%', top: '12%', size: 13, delay: 6.3, dur: 20, rotate: 15,  color: '#bbf7d0' },
  { id: 4, left: '68%', top: '24%', size: 15, delay: 1.7, dur: 19, rotate: -32, color: '#a7f3d0' },
  { id: 5, left: '83%', top: '64%', size: 12, delay: 4.5, dur: 24, rotate: 22,  color: '#67e8f9' },
  { id: 6, left: '52%', top: '83%', size: 14, delay: 7.2, dur: 21, rotate: -8,  color: '#bef264' },
];

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
    >
      {/* Base environmental wash */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'linear-gradient(125deg, rgba(5, 46, 22, 0.78) 0%, rgba(7, 35, 43, 0.76) 44%, rgba(20, 31, 18, 0.82) 100%)',
          'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 28%, rgba(2,6,23,0.42) 100%)',
        ].join(', '),
      }} />

      {/* Fine monitoring grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(187,247,208,0.035) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(103,232,249,0.028) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '44px 44px',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.25) 68%, transparent)',
      }} />

      {/* Soft canopy texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: [
          'repeating-linear-gradient(115deg, rgba(134,239,172,0.045) 0 1px, transparent 1px 38px)',
          'repeating-linear-gradient(64deg, rgba(125,211,252,0.032) 0 1px, transparent 1px 54px)',
        ].join(', '),
        opacity: 0.8,
      }} />

      {/* Air-flow ribbons */}
      {AIR_LINES.map(line => (
        <motion.div
          key={line.id}
          style={{
            position: 'absolute',
            top: line.top,
            left: line.left,
            width: line.width,
            height: 2,
            borderRadius: 999,
            background: 'linear-gradient(90deg, transparent, rgba(190,242,100,0.55), rgba(34,211,238,0.35), transparent)',
            opacity: line.opacity,
            boxShadow: '0 0 18px rgba(134,239,172,0.2)',
            transform: 'rotate(-5deg)',
          }}
          animate={{ x: ['-10%', '34%', '-10%'], opacity: [0.08, line.opacity, 0.08] }}
          transition={{ duration: line.dur, delay: line.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Drifting leaf accents */}
      {LEAVES.map(leaf => (
        <motion.div
          key={leaf.id}
          style={{
            position: 'absolute',
            left: leaf.left,
            top: leaf.top,
            color: leaf.color,
            opacity: 0.32,
            filter: 'drop-shadow(0 8px 18px rgba(16,185,129,0.22))',
          }}
          animate={{
            x: [0, 18, -12, 0],
            y: [0, -16, 12, 0],
            rotate: [leaf.rotate, leaf.rotate + 16, leaf.rotate - 10, leaf.rotate],
          }}
          transition={{
            duration: leaf.dur,
            delay: leaf.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <TbLeaf size={leaf.size} />
        </motion.div>
      ))}

      {/* Landscape bands */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: '28%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(8,47,73,0.24) 28%, rgba(4,24,13,0.8) 100%)',
        clipPath: 'polygon(0 46%, 10% 40%, 22% 52%, 36% 36%, 51% 48%, 67% 31%, 82% 44%, 100% 32%, 100% 100%, 0 100%)',
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, rgba(2,6,23,0.34), transparent 22%, transparent 74%, rgba(2,6,23,0.38))',
      }} />
    </div>
  );
}
