import React from "react";
export default function Badge({ children, variant="neutral", size="md", className="" }) { return <span className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`}>{children}</span>; }
