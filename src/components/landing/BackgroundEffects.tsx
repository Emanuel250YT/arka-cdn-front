"use client";

import { useState, useEffect } from "react";

export const BackgroundEffects = () => {
    const [windowWidth, setWindowWidth] = useState(1024);

    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }, []);

    const colorSpots = [
      { top: 8, left: 15, width: 420, height: 380, color: 'rgba(107, 33, 168, 0.08)', blur: 140, delay: 0 },
      { top: 32, left: 72, width: 580, height: 520, color: 'rgba(124, 58, 237, 0.06)', blur: 160, delay: 1.2 },
      { top: 58, left: 22, width: 340, height: 440, color: 'rgba(139, 92, 246, 0.05)', blur: 120, delay: 0.7 },
      { top: 15, left: 68, width: 280, height: 320, color: 'rgba(107, 33, 168, 0.07)', blur: 130, delay: 1.8 },
      { top: 71, left: 85, width: 480, height: 360, color: 'rgba(124, 58, 237, 0.04)', blur: 150, delay: 0.4 },
    ];
  
    const lightDots = [
      { top: 12, left: 23, delay: 0, opacity: 0.4, size: 1.2, color: 'rgba(107, 33, 168, 0.6)' },
      { top: 28, left: 67, delay: 1.1, opacity: 0.5, size: 1.8, color: 'rgba(124, 58, 237, 0.7)' },
      { top: 45, left: 34, delay: 0.3, opacity: 0.3, size: 1.1, color: 'rgba(139, 92, 246, 0.5)' },
      { top: 19, left: 81, delay: 0.9, opacity: 0.6, size: 1.5, color: 'rgba(107, 33, 168, 0.8)' },
      { top: 52, left: 56, delay: 1.5, opacity: 0.4, size: 1.3, color: 'rgba(124, 58, 237, 0.6)' },
      { top: 33, left: 19, delay: 0.6, opacity: 0.3, size: 1.0, color: 'rgba(139, 92, 246, 0.4)' },
      { top: 67, left: 74, delay: 1.9, opacity: 0.5, size: 1.6, color: 'rgba(107, 33, 168, 0.7)' },
      { top: 8, left: 52, delay: 0.2, opacity: 0.4, size: 1.2, color: 'rgba(124, 58, 237, 0.6)' },
      { top: 41, left: 88, delay: 1.3, opacity: 0.3, size: 1.1, color: 'rgba(139, 92, 246, 0.4)' },
      { top: 74, left: 41, delay: 0.8, opacity: 0.5, size: 1.7, color: 'rgba(107, 33, 168, 0.7)' },
      { top: 26, left: 45, delay: 1.7, opacity: 0.4, size: 1.3, color: 'rgba(124, 58, 237, 0.6)' },
      { top: 59, left: 28, delay: 0.5, opacity: 0.3, size: 1.0, color: 'rgba(139, 92, 246, 0.4)' },
    ];
  
    return (
      <>
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 15%, rgba(107, 33, 168, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 75% 40%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 45% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
              linear-gradient(to bottom, #0a0a0a 0%, #0d0d0d 35%, #0f0f0f 58%, #0b0b0b 78%, #0a0a0a 100%)
            `,
          }}
        />
  
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {colorSpots.map((spot, i) => {
            const scaleFactor = windowWidth < 640 ? 0.6 : windowWidth < 1024 ? 0.8 : 1;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${spot.top}%`,
                  left: `${spot.left}%`,
                  width: `${spot.width * scaleFactor}px`,
                  height: `${spot.height * scaleFactor}px`,
                  background: spot.color,
                  filter: `blur(${spot.blur * scaleFactor}px)`,
                  transform: `translate(-50%, -50%) scale(${0.95 + (i % 3) * 0.1})`,
                  animation: `floatSpot ${8 + i * 1.5}s ease-in-out infinite`,
                  animationDelay: `${spot.delay}s`,
                  opacity: 0.7,
                }}
              />
            );
          })}
        </div>
  
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        <div 
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, .4) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0',
          }}
        />
  
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {lightDots.map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                transform: 'translate(-50%, -50%)',
                animation: `twinkle ${3 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${dot.delay}s`,
                opacity: dot.opacity,
                background: dot.color,
                boxShadow: `0 0 ${dot.size * 2}px ${dot.color}`,
              }}
            />
          ))}
        </div>
      </>
    );
  };
  