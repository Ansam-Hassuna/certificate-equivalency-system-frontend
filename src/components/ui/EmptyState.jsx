import React from "react";
import Icon from "./Icon";
export default function EmptyState({ title="لا توجد بيانات", description, action, compact=false }) { return <div className={`ui-state ${compact ? "ui-state--compact" : ""}`}><span className="ui-state__icon"><Icon name="inbox" size={compact ? 24 : 34}/></span><h3>{title}</h3>{description && <p>{description}</p>}{action && <div className="ui-state__action">{action}</div>}</div>; }
