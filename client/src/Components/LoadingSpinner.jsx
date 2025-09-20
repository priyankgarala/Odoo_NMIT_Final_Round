import React from "react";

/**
 * LoadingSpinner
 * A reusable spinner to indicate loading states.
 *
 * Props:
 * - fullscreen (boolean): If true, covers the viewport and centers the spinner.
 * - size (number): Diameter of the spinner in pixels. Default 40.
 * - thickness (number): Border thickness in pixels. Default 4.
 * - color (string): CSS color for the spinner accent (hex/rgb/hsl). Default "#3b82f6".
 * - text (string): Optional helper text below the spinner.
 * - className (string): Optional additional classes for the wrapper.
 */
const LoadingSpinner = ({
  fullscreen = false,
  size = 40,
  thickness = 4,
  color = "#3b82f6",
  text,
  className = "",
}) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${thickness}px`,
  };

  const Wrapper = fullscreen ? "div" : React.Fragment;
  const wrapperProps = fullscreen
    ? {
        className: `fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px] ${className}`,
      }
    : {};

  return (
    <Wrapper {...wrapperProps}>
      <div className={`flex flex-col items-center justify-center ${!fullscreen ? className : ""}`} role="status" aria-busy="true">
        <div
          className={`animate-spin rounded-full border-neutral-200 dark:border-neutral-700`}
          style={{
            ...spinnerStyle,
            borderTopColor: color,
          }}
        />
        {text ? (
          <div className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{text}</div>
        ) : null}
        <span className="sr-only">Loading...</span>
      </div>
    </Wrapper>
  );
};

export default LoadingSpinner;


