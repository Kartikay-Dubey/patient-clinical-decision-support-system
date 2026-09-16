import React, { useCallback, useMemo } from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useReducedMotion } from 'framer-motion';

async function initParticles(engine) {
  await loadSlim(engine);
}

export default function ResultsPanelFill() {
  const reduceMotion = useReducedMotion();
  const init = useCallback(initParticles, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      detectRetina: true,
      fpsLimit: 60,
      pauseOnBlur: true,
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: { enable: !reduceMotion, mode: ['grab', 'attract'] },
          onClick: { enable: !reduceMotion, mode: 'push' },
          resize: { enable: true },
        },
        modes: {
          grab: { distance: 150, links: { opacity: 0.7 } },
          attract: { distance: 180, duration: 0.4, factor: 2 },
          push: { quantity: 3 },
        },
      },
      particles: {
        number: { value: reduceMotion ? 18 : 48, density: { enable: true, width: 800, height: 800 } },
        color: { value: ['#0D9488', '#14B8A6', '#22D3EE', '#38BDF8'] },
        links: {
          enable: true,
          color: '#5EEAD4',
          distance: 130,
          opacity: 0.35,
          width: 1,
        },
        move: {
          enable: !reduceMotion,
          speed: 1.15,
          direction: 'none',
          outModes: { default: 'bounce' },
        },
        opacity: { value: { min: 0.25, max: 0.75 } },
        size: { value: { min: 1.4, max: 3.6 } },
        shape: { type: 'circle' },
      },
    }),
    [reduceMotion]
  );

  return (
    <div className="results-panel-fill">
      <ParticlesProvider init={init}>
        <Particles
          id="results-particles"
          options={options}
          className="absolute inset-0 h-full w-full"
        />
      </ParticlesProvider>
    </div>
  );
}
