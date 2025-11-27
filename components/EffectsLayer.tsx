import React, { useRef, useEffect } from 'react';
import { GameEvent } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'DUST' | 'SPARKLE' | 'TEXT' | 'CONFETTI';
  text?: string;
  gravity?: number;
}

interface Props {
  lastEvent: GameEvent | null;
  width: number;
  height: number;
}

const EffectsLayer: React.FC<Props> = ({ lastEvent, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();

  // Cell dimensions approximation
  const cellWidth = width / 10;
  const cellHeight = height / 20;

  const spawnParticles = (event: GameEvent) => {
    const newParticles: Particle[] = [];

    if (event.type === 'DROP' || event.type === 'LOCK') {
      const { x, y, shape } = event.payload || { x: 0, y: 0, shape: [[1]] };
      
      // Spawn dust at the bottom of the piece
      // Iterate through the bottom-most cells of the shape
      // Simplified: Just spawn around the impact area
      const centerX = (x + 1.5) * cellWidth; // Approx center
      const bottomY = (y + (shape ? shape.length : 1)) * cellHeight;

      const count = event.type === 'DROP' ? 15 : 5;
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: centerX + (Math.random() - 0.5) * cellWidth * 3,
          y: bottomY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() * -5) - 2, // Upwards
          life: 1.0,
          maxLife: 1.0,
          color: event.type === 'DROP' ? '255, 255, 255' : '255, 200, 100',
          size: Math.random() * 4 + 1,
          type: event.type === 'DROP' ? 'DUST' : 'SPARKLE',
          gravity: 0.1
        });
      }
    }

    if (event.type === 'CLEAR') {
      const { rows, points, combo } = event.payload;
      
      // Floating Text
      const textY = (rows[0] * cellHeight) + (cellHeight / 2);
      newParticles.push({
        x: width / 2,
        y: textY,
        vx: 0,
        vy: -1,
        life: 2.0, // Lives longer
        maxLife: 2.0,
        color: '255, 215, 0',
        size: 30 + (combo * 5),
        type: 'TEXT',
        text: `+${points}`,
        gravity: 0
      });

      if (combo >= 4) {
         newParticles.push({
            x: width / 2,
            y: textY - 40,
            vx: 0,
            vy: -1.5,
            life: 2.5,
            maxLife: 2.5,
            color: '255, 0, 255',
            size: 40,
            type: 'TEXT',
            text: 'HYPER TETRIS!',
            gravity: 0
          });
      }

      // Confetti Explosion
      for (let i = 0; i < 50 * combo; i++) {
        const rowY = rows[Math.floor(Math.random() * rows.length)] * cellHeight;
        newParticles.push({
          x: Math.random() * width,
          y: rowY + cellHeight / 2,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1.5,
          maxLife: 1.5,
          color: `${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 255`,
          size: Math.random() * 6 + 2,
          type: 'CONFETTI',
          gravity: 0.2
        });
      }
    }
    
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  useEffect(() => {
    if (lastEvent) {
      spawnParticles(lastEvent);
    }
  }, [lastEvent]);

  const update = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, width, height);

    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    particlesRef.current.forEach(p => {
      p.life -= 0.02;
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;

      const alpha = Math.max(0, p.life / p.maxLife);

      if (p.type === 'TEXT' && p.text) {
        ctx.font = `bold ${p.size}px "Press Start 2P"`;
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = `rgba(0,0,0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'CONFETTI') {
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 10);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        // Dust / Sparkle
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
};

export default React.memo(EffectsLayer);