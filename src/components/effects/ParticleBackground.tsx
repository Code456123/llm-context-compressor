import React, { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  hue: number;
  mass: number;
};

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let lastMoveAt = performance.now();
    let compressionSeed = Math.random() * 5000;

    const createParticles = (w: number, h: number) => {
      const count = Math.max(52, Math.min(Math.floor((w * h) / 17000), 110));
      return Array.from({ length: count }, () => {
        const baseSpeed = 0.1 + Math.random() * 0.42;
        const angle = (Math.random() * Math.PI) / 3 - Math.PI / 8;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed,
          baseVx: Math.cos(angle) * baseSpeed,
          baseVy: Math.sin(angle) * baseSpeed,
          size: 0.75 + Math.random() * 2.4,
          alpha: 0.2 + Math.random() * 0.55,
          hue: [188, 194, 206, 212, 264][Math.floor(Math.random() * 5)],
          mass: 0.8 + Math.random() * 1.6,
        };
      });
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = createParticles(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
      lastMoveAt = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      targetMouseX = touch.clientX;
      targetMouseY = touch.clientY;
      lastMoveAt = performance.now();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = () => {
      const now = performance.now();
      const cursorActivity = Math.max(0, 1 - (now - lastMoveAt) / 1800);
      const compressionPhase = (Math.sin((now + compressionSeed) * 0.00035) + 1) * 0.5;
      const compressionX = width * (0.18 + compressionPhase * 0.58);
      const compressionY = height * (0.45 + Math.sin((now + compressionSeed) * 0.0002) * 0.12);

      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;

      ctx.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const dxMouse = particle.x - mouseX;
        const dyMouse = particle.y - mouseY;
        const distMouse = Math.sqrt((dxMouse * dxMouse) + (dyMouse * dyMouse));
        const influenceRadius = 130;
        if (distMouse < influenceRadius) {
          const influence = (1 - distMouse / influenceRadius) * cursorActivity;
          const direction = index % 4 === 0 ? -1 : 1;
          const normalizedX = distMouse > 0 ? dxMouse / distMouse : 0;
          const normalizedY = distMouse > 0 ? dyMouse / distMouse : 0;
          particle.vx += normalizedX * influence * 0.22 * direction;
          particle.vy += normalizedY * influence * 0.22 * direction;
        }

        const cdx = compressionX - particle.x;
        const cdy = compressionY - particle.y;
        const compressionDistance = Math.sqrt((cdx * cdx) + (cdy * cdy));
        if (compressionDistance < 200) {
          const pull = (1 - compressionDistance / 200) * 0.012;
          const hubShift = index % 3 === 0 ? -26 : index % 3 === 1 ? 24 : 0;
          const targetY = compressionY + hubShift;
          const tx = compressionX - particle.x;
          const ty = targetY - particle.y;
          const td = Math.sqrt((tx * tx) + (ty * ty)) || 1;
          particle.vx += (tx / td) * pull;
          particle.vy += (ty / td) * pull;
        }

        particle.vx += (particle.baseVx - particle.vx) * 0.016;
        particle.vy += (particle.baseVy - particle.vy) * 0.016;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.x += particle.vx * particle.mass;
        particle.y += particle.vy * particle.mass;

        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.y > height + 8) particle.y = -8;
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt((dx * dx) + (dy * dy));
          const maxDistance = 94;
          if (distance > maxDistance) {
            continue;
          }
          const nearCursor =
            Math.min(
              Math.sqrt(((a.x - mouseX) ** 2) + ((a.y - mouseY) ** 2)),
              Math.sqrt(((b.x - mouseX) ** 2) + ((b.y - mouseY) ** 2))
            ) < 155;
          const alphaBoost = nearCursor ? 0.045 * cursorActivity : 0;
          const alpha = ((1 - distance / maxDistance) * 0.085) + alphaBoost;
          ctx.strokeStyle = `rgba(94, 234, 212, ${alpha})`;
          ctx.lineWidth = nearCursor ? 1.05 : 0.65;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const isCompressionFocus =
          Math.sqrt(((particle.x - compressionX) ** 2) + ((particle.y - compressionY) ** 2)) < 110;
        const brightness = isCompressionFocus ? 68 : 60;
        const alpha = particle.alpha * (isCompressionFocus ? 1.18 : 1);
        ctx.fillStyle = `hsla(${particle.hue}, 88%, ${brightness}%, ${alpha})`;
        ctx.shadowColor = `hsla(${particle.hue}, 96%, 66%, ${alpha})`;
        ctx.shadowBlur = isCompressionFocus ? 12 : 7;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      const streamLine = ctx.createLinearGradient(width * 0.08, height * 0.2, width * 0.92, height * 0.8);
      streamLine.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
      streamLine.addColorStop(0.5, 'rgba(45, 212, 191, 0.04)');
      streamLine.addColorStop(1, 'rgba(147, 51, 234, 0.03)');
      ctx.strokeStyle = streamLine;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(width * 0.06, height * 0.38);
      ctx.bezierCurveTo(width * 0.34, height * 0.28, width * 0.66, height * 0.64, width * 0.94, height * 0.52);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
