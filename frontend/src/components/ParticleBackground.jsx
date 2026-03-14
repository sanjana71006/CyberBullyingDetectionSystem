import { memo } from 'react';

function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="cyber-bg-base" />
      <div className="cyber-bg-grid" />
      <div className="cyber-bg-vlines" />
      <div className="cyber-bg-glow cyber-bg-glow-one" />
      <div className="cyber-bg-glow cyber-bg-glow-two" />
      <div className="cyber-bg-sweep" />
    </div>
  );
}

export default memo(ParticleBackground);
