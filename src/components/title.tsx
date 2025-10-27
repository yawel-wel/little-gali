interface TitleProps {
  /**
   * The full title text. The `highlightText` should be a substring of this.
   */
  children: string;
  /**
   * The word or phrase to highlight in the title
   */
  highlightText: string;
  /**
   * Size variant for the title
   */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to use rounded underline style
   */
  roundedUnderline?: boolean;
}

const sizeClasses = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-3xl lg:text-4xl",
  xl: "text-4xl md:text-5xl",
  "2xl": "text-4xl sm:text-4xl md:text-5xl lg:text-7xl",
};

const underlineHeight = {
  sm: "4px",
  md: "6px",
  lg: "6px",
  xl: "8px",
  "2xl": "8px",
};

export function Title({
  children,
  highlightText,
  size = "md",
  className = "",
  roundedUnderline = false,
}: TitleProps) {
  // Find the position of the highlight text in the title
  const highlightIndex = children.indexOf(highlightText);

  // If highlight text not found, just return the children
  if (highlightIndex === -1) {
    return (
      <h2
        className={`font-black text-dark-gray leading-tight ${sizeClasses[size]} ${className}`}
      >
        {children}
      </h2>
    );
  }

  // Split the title into parts: before, highlight, after
  const beforeText = children.substring(0, highlightIndex);
  const afterText = children.substring(highlightIndex + highlightText.length);

  // Determine the underline style based on roundedUnderline and size
  let borderRadius: string;
  let transform: string;

  if (roundedUnderline) {
    borderRadius = "4px";
    transform = "rotate(-1deg) translateY(0px)";
  } else {
    const isSmallSize = size === "sm";
    borderRadius = isSmallSize ? "4px" : "6px 6px 0 0";
    transform = "rotate(-2deg) translateY(0px)";
  }

  return (
    <h2
      className={`font-black text-dark-gray leading-tight ${sizeClasses[size]} ${className}`}
    >
      {beforeText}
      <span className="relative inline-block">
        <span className="relative z-10">{highlightText}</span>
        <span
          className="absolute bottom-0 left-0 right-0 transform -rotate-1"
          style={{
            height: underlineHeight[size],
            borderRadius: borderRadius,
            transform: transform,
            background:
              "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
            boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
            width: "110%",
            left: "-5%",
          }}
        ></span>
      </span>
      {afterText}
    </h2>
  );
}
