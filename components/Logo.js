export default function Logo({ size = "default" }) {
  const compact = size === "small";
  const markSize = compact ? 32 : 42;
  const iconSize = compact ? 18 : 24;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginBottom: compact ? 0 : "12px",
      }}
    >
      <div
        style={{
          width: `${markSize}px`,
          height: `${markSize}px`,
          borderRadius: compact ? "9px" : "12px",
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(13, 148, 136, 0.35)",
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 12L10 10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 12L15 8.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="9" y="3" width="6" height="4" rx="1.5" fill="white" />
        </svg>
      </div>

      <span
        style={{
          fontSize: compact ? "20px" : "26px",
          fontWeight: "800",
          color: "#1e293b",
          letterSpacing: "-0.5px",
          whiteSpace: "nowrap",
        }}
      >
        Task<span style={{ color: "#0d9488" }}>Flow</span>
      </span>
    </div>
  );
}
