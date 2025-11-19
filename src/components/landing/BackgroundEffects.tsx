export const BackgroundEffects = () => {
  const stars = [
    { top: 10, left: 45, delay: 0, opacity: 0.6, size: 2 },
    { top: 20, left: 50, delay: 0.2, opacity: 0.7, size: 1.5 },
    { top: 30, left: 48, delay: 0.4, opacity: 0.8, size: 2 },
    { top: 25, left: 52, delay: 0.1, opacity: 0.5, size: 1 },
    { top: 35, left: 49, delay: 0.3, opacity: 0.7, size: 1.5 },
    { top: 15, left: 47, delay: 0.15, opacity: 0.6, size: 1 },
    { top: 40, left: 51, delay: 0.5, opacity: 0.6, size: 1.5 },
    { top: 5, left: 20, delay: 1, opacity: 0.4, size: 1 },
    { top: 12, left: 75, delay: 1.2, opacity: 0.5, size: 1.5 },
    { top: 45, left: 15, delay: 1.5, opacity: 0.3, size: 1 },
    { top: 55, left: 80, delay: 1.8, opacity: 0.6, size: 1.5 },
    { top: 70, left: 45, delay: 2, opacity: 0.4, size: 1 },
    { top: 65, left: 25, delay: 2.3, opacity: 0.5, size: 1 },
    { top: 20, left: 60, delay: 0.8, opacity: 0.4, size: 1 },
    { top: 50, left: 70, delay: 1.7, opacity: 0.3, size: 1 },
  ];

  return (
    <>
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 30%, #0f172a 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-700 rounded-full blur-[150px] opacity-15 animate-glow-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
      </div>

      <div className="absolute inset-0 opacity-25">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(96, 165, 250, 0.25) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(96, 165, 250, 0.25) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            transform: "perspective(800px) rotateX(75deg)",
            transformOrigin: "center bottom",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          }}
        ></div>
      </div>

      <div
        style={{
          transform: "perspective(200px) rotateX(75deg)",
          transformOrigin: "center bottom",
        }}
        className="h-full absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)]"
      ></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-blue-300 rounded-full animate-pulse"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity,
              boxShadow:
                star.size > 1.5
                  ? "0 0 4px rgba(147, 197, 253, 0.8)"
                  : "0 0 2px rgba(147, 197, 253, 0.6)",
            }}
          />
        ))}
      </div>
    </>
  );
};

