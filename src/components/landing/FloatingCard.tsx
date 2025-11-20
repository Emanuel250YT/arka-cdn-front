"use client";
import React, { useState, useEffect } from "react";
import { Image } from "lucide-react";

interface FloatingCardProps {
  delay?: number;
  rotation?: number;
  style?: React.CSSProperties;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  delay = 0,
  rotation = 0,
  style,
}) => {
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

  const renderCardLogo = () => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image size={96} className="text-white" />;
  };

  const { transform: styleTransform, top, left, ...restStyle } = style || {};

  const baseTransform = `rotateY(${rotation}deg) rotateX(${
    rotation / 2
  }deg) translateZ(0)`;
  const finalTransform = styleTransform
    ? `${styleTransform} ${baseTransform}`
    : baseTransform;

  const shadowX = Math.sin((rotation * Math.PI) / 180) * 30;

  const cardWidth = windowWidth < 640 
    ? 192 
    : windowWidth < 1024 
    ? 224 
    : 256;
  const cardHeight = windowWidth < 640 
    ? 240 
    : windowWidth < 1024 
    ? 280 
    : 320;
  const shadowWidth = cardWidth * 1.25;
  const shadowHeight = cardHeight * 0.625;
  const logoScale = windowWidth < 640 ? 0.6 : windowWidth < 1024 ? 0.75 : 1;

  return (
    <div
      className="absolute"
      style={{
        top,
        left,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      <div
        className="absolute rounded-3xl pointer-events-none"
        style={{
          width: `${shadowWidth}px`,
          height: `${shadowHeight}px`,
          left: `${shadowX - 10}px`,
          top: `${cardHeight * 1.45}px`,
          background: `radial-gradient(ellipse at center, 
            rgba(107, 33, 168, 0.25) 0%, 
            rgba(107, 33, 168, 0.15) 30%, 
            rgba(124, 58, 237, 0.08) 50%,
            transparent 80%)`,
          filter: `blur(40px)`,
          opacity: 0.7,
          transform: `scaleY(0.4) scaleX(${
            1 - Math.abs(Math.sin((rotation * Math.PI) / 180)) * 0.2
          })`,
          transition: "all 0.3s ease",
        }}
      />

      <div
        className="absolute rounded-3xl"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          transformStyle: "preserve-3d",
          transform: finalTransform,
          animation: `floatCard 6s ease-in-out infinite`,
          animationDelay: `${delay}s`,
          willChange: "transform",
          ...restStyle,
        }}
      >
        <div
          className="absolute inset-0 rounded-3xl backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, 
              rgba(107, 33, 168, 0.2) 0%, 
              rgba(124, 58, 237, 0.18) 20%,
              rgba(139, 92, 246, 0.16) 50%,
              rgba(124, 58, 237, 0.14) 80%,
              rgba(107, 33, 168, 0.12) 100%)`,
            border: `1px solid rgba(107, 33, 168, 0.4)`,
            backfaceVisibility: "hidden",
            boxShadow: `
              0 30px 100px rgba(107, 33, 168, 0.3),
              0 0 80px rgba(124, 58, 237, 0.25),
              inset 0 1px 2px rgba(255, 255, 255, 0.3),
              inset 0 -1px 2px rgba(107, 33, 168, 0.2)
            `,
            transform: "translateZ(20px)",
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
            style={{
              background: `linear-gradient(180deg, 
                rgba(107, 33, 168, 0.25) 0%, 
                rgba(124, 58, 237, 0.18) 15%,
                rgba(139, 92, 246, 0.12) 30%,
                transparent 60%,
                transparent 100%)`,
              maskImage: `linear-gradient(180deg, black 0%, transparent 50%)`,
              WebkitMaskImage: `linear-gradient(180deg, black 0%, transparent 50%)`,
            }}
          />

          <div
            className="absolute top-0 left-0 right-0 h-12 rounded-t-3xl pointer-events-none overflow-hidden"
            style={{
              background: `linear-gradient(180deg, 
                rgba(107, 33, 168, 0.15) 0%,
                rgba(124, 58, 237, 0.2) 50%)
                transparent 100%)`,
            }}
          />

          <div
            className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
            style={{
              background: `linear-gradient(315deg, 
                transparent 0%,
                transparent 50%,
                rgba(107, 33, 168, 0.15) 80%,
                rgba(124, 58, 237, 0.2) 100%)`,
              maskImage: `linear-gradient(315deg, transparent 0%, black 40%)`,
              WebkitMaskImage: `linear-gradient(315deg, transparent 0%, black 40%)`,
            }}
          />

          <div
            className="absolute inset-2 rounded-2xl pointer-events-none"
            style={{
              border: `1px solid rgba(255, 255, 255, 0.3)`,
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                transparent 50%)`,
            }}
          />

          <div
            className="relative h-full flex items-center justify-center"
            style={{
              transform: "translateZ(30px)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                filter: `drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3)) 
                         drop-shadow(0 0 16px rgba(107, 33, 168, 0.4))
                         drop-shadow(2px 2px 4px rgba(124, 58, 237, 0.3))`,
                transform: "translateZ(10px)",
              }}
            >
              <div style={{ 
                transform: `scale(${logoScale})` 
              }}>
                {renderCardLogo()}
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            border: `2px solid transparent`,
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.2) 0%,
              transparent 25%,
              transparent 75%,
              rgba(107, 33, 168, 0.2) 100%)`,
            backgroundClip: "padding-box",
            WebkitBackgroundClip: "padding-box",
            maskImage: `linear-gradient(135deg, black 0%, transparent 30%, transparent 70%, black 100%)`,
            WebkitMaskImage: `linear-gradient(135deg, black 0%, transparent 30%, transparent 70%, black 100%)`,
            boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, 0.5)`,
          }}
        />
      </div>
    </div>
  );
};

export const FloatingCards: React.FC = () => {
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

  const getCardPositions = () => {
    if (windowWidth < 640) {
      return {
        card1: { top: "0px", left: "calc(50% - 60px)" },
        card2: { top: "80px", left: "calc(50% - 10px)" },
        card3: { top: "160px", left: "calc(50% + 40px)" },
        containerHeight: "280px",
        rotation1: 15,
        rotation2: 5,
        rotation3: -10,
      };
    } else if (windowWidth < 1024) {
      return {
        card1: { top: "0px", left: "calc(50% - 80px)" },
        card2: { top: "100px", left: "calc(50% - 15px)" },
        card3: { top: "200px", left: "calc(50% + 50px)" },
        containerHeight: "380px",
        rotation1: 20,
        rotation2: 8,
        rotation3: -12,
      };
    } else {
      return {
        card1: { top: "0px", left: "calc(50% - 100px)" },
        card2: { top: "120px", left: "calc(50% - 20px)" },
        card3: { top: "240px", left: "calc(50% + 60px)" },
        containerHeight: "500px",
        rotation1: 25,
        rotation2: 10,
        rotation3: -15,
      };
    }
  };

  const positions = getCardPositions();

  return (
    <div 
      className="relative w-full perspective-[1200px] mx-auto"
      style={{ height: positions.containerHeight }}
    >

      <FloatingCard
        delay={0}
        rotation={positions.rotation1}
        style={{
          top: positions.card1.top,
          left: positions.card1.left,
        }}
      />

      <FloatingCard
        delay={1}
        rotation={positions.rotation2}
        style={{
          top: positions.card2.top,
          left: positions.card2.left,
        }}
      />

      <FloatingCard
        delay={2}
        rotation={positions.rotation3}
        style={{
          top: positions.card3.top,
          left: positions.card3.left,
        }}
      />
    </div>
  );
};
