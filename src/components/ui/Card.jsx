import React from "react";
export default function Card({ title, subtitle, actions, children, variant="default", className="", as: Tag="section" }) {
 return <Tag className={`ui-card ui-card--${variant} ${className}`}><div className="ui-card__header">{(title || subtitle) && <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>}{actions && <div className="ui-card__actions">{actions}</div>}</div>{children}</Tag>;
}
