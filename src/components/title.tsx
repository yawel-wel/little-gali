import { motion } from "framer-motion";

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
  /**
   * Text color class (e.g., "text-white", "text-dark-gray")
   */
  color?: string;
  /**
   * Whether to animate the underline on mount (for hero section)
   */
  animateUnderline?: boolean;
  /**
   * HTML heading element to use (h1, h2, h3, etc.)
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /**
   * ID for the heading element
   */
  id?: string;
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
  color = "text-dark-gray",
  animateUnderline = false,
  as: HeadingTag = "h2",
  id,
}: TitleProps) {
  // Find the position of the highlight text in the title
  const highlightIndex = children.indexOf(highlightText);

  // If highlight text not found, just return the children
  if (highlightIndex === -1) {
    return (
      <HeadingTag
        id={id}
        className={`font-heading ${color} leading-tight ${sizeClasses[size]} ${className}`}
      >
        {children}
      </HeadingTag>
    );
  }

  // Split the title into parts: before, highlight, after
  const beforeText = children.substring(0, highlightIndex);
  const afterText = children.substring(highlightIndex + highlightText.length);

  // Determine the rotation based on roundedUnderline
  const rotation = roundedUnderline ? -1 : -2;
  const height = parseInt(underlineHeight[size]) || 8;
  const svgHeight = Math.max(height + 6, 14); // Add extra height for the curve

  // Create a curvy underline path - smooth arc that curves upward in the middle
  // Using a quadratic Bezier curve for a smooth, organic curve that faces up
  // Start and end points are lower, control point is higher to create upward curve
  const pathData = `M 0 ${svgHeight} Q 50 ${svgHeight - 4}, 100 ${svgHeight}`;

  const UnderlineComponent = animateUnderline ? motion.svg : "svg";

  return (
    <HeadingTag
      id={id}
      className={`font-heading ${color} leading-tight ${sizeClasses[size]} ${className}`}
    >
      {beforeText}
      <span className="relative inline-block z-0">
        <span className="relative z-10">{highlightText}</span>
        <UnderlineComponent
          className="absolute bottom-0 left-0"
          aria-hidden="true"
          style={{
            width: "110%",
            left: "-5%",
            height: `${svgHeight}px`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: animateUnderline ? "right center" : "left center",
            overflow: "visible",
          }}
          {...(animateUnderline && {
            initial: { scaleX: 0 },
            animate: { scaleX: 1 },
            transition: {
              delay: 0.75,
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            },
          })}
          preserveAspectRatio="none"
          viewBox={`0 0 100 ${svgHeight}`}
        >
          <path
            d={pathData}
            stroke="#e1a27d"
            strokeWidth={height}
            fill="none"
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(225, 162, 125, 0.3))",
            }}
          />
        </UnderlineComponent>
      </span>
      {afterText}
    </HeadingTag>
  );
}
