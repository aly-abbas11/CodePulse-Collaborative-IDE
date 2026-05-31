import "./CodePulseLogo.css";

export default function CodePulseLogo({
  size = "md",
  showWordmark = true,
  wordmark = "CODEPULSE",
  pulse = false,
  neon = false,
  className = "",
  onClick,
  markRef,
  pulseRingRef,
  wordmarkClassName = "",
}) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={[
        "cpl-root",
        `cpl-${size}`,
        neon ? "cpl-neon" : "cpl-themed",
        pulse ? "cpl-has-pulse" : "",
        onClick ? "cpl-interactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      <div className="cpl-mark-wrap">
        {pulse && (
          <div
            ref={pulseRingRef}
            className="cpl-pulse-ring"
            aria-hidden="true"
          />
        )}
        <div ref={markRef} className="cpl-mark" aria-hidden="true">
          {"{}"}
        </div>
      </div>
      {showWordmark && (
        <span className={`cpl-wordmark ${wordmarkClassName}`.trim()}>
          {wordmark}
        </span>
      )}
    </Tag>
  );
}
