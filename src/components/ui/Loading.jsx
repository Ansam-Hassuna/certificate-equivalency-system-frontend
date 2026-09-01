import React from "react";
export default function Loading({ size="md", label="جاري التحميل...", fullPage=false }) { return <div className={`ui-loading ${fullPage ? "ui-loading--page" : ""}`} role="status" aria-live="polite"><span className={`ui-spinner ui-spinner--${size}`} aria-hidden="true" />{label && <span>{label}</span>}</div>; }
