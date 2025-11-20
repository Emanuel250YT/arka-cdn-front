"use client";
import React from "react";
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
          width: "320px",
          height: "200px",
          left: `${shadowX - 10}px`,
          top: "350px",
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
        className="absolute w-64 h-80 rounded-3xl"
        style={{
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
              {renderCardLogo()}
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
  return (
    <div className="relative w-full h-[500px] perspective-[1200px] mx-auto">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-full pointer-events-none"
        style={{
          background: `linear-gradient(180deg, 
            rgba(107, 33, 168, 0.6) 0%, 
            rgba(124, 58, 237, 0.5) 20%, 
            rgba(139, 92, 246, 0.4) 40%, 
            rgba(124, 58, 237, 0.25) 60%,
            rgba(107, 33, 168, 0.1) 80%,
            transparent 100%)`,
          filter: `blur(80px)`,
          opacity: 0.9,
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-full pointer-events-none"
        style={{
          background: `linear-gradient(180deg, 
            rgba(107, 33, 168, 0.8) 0%, 
            rgba(124, 58, 237, 0.6) 25%, 
            rgba(139, 92, 246, 0.4) 50%, 
            transparent 100%)`,
          filter: `blur(50px)`,
          opacity: 0.7,
        }}
      />

      <FloatingCard
        delay={0}
        rotation={25}
        style={{
          top: "0px",
          left: "calc(50% - 100px)",
        }}
      />

      <FloatingCard
        delay={1}
        rotation={10}
        style={{
          top: "120px",
          left: "calc(50% - 20px)",
        }}
      />

      <FloatingCard
        delay={2}
        rotation={-15}
        style={{
          top: "240px",
          left: "calc(50% + 60px)",
        }}
      />
    </div>
  );
};
