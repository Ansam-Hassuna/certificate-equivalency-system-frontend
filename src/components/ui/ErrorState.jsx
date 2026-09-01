import React from "react";
import Icon from "./Icon";
export default function ErrorState({ title="حدث خطأ", description="تعذر تحميل البيانات. حاول مرة أخرى.", action }) { return <div className="ui-state ui-state--error"><span className="ui-state__icon"><Icon name="warning" size={34}/></span><h3>{title}</h3><p>{description}</p>{action && <div className="ui-state__action">{action}</div>}</div>; }
