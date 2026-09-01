import React from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import Table from "../../components/ui/Table";

export default function ScreenShell({ title, description, icon = "document", actions, stats = [], children }) {
  return (
    <div className="page workflow-screen">
      <div className="workflow-heading">
        <div className="workflow-title-wrap">
          <span className="workflow-title-icon"><Icon name={icon} size={26} /></span>
          <div>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </div>
        {actions && <div className="workflow-actions">{actions}</div>}
      </div>

      {stats.length > 0 && (
        <div className="workflow-stats">
          {stats.map((stat) => (
            <Card key={stat.label} className="workflow-stat-card">
              <div className="workflow-stat-label">{stat.label}</div>
              <div className="workflow-stat-value">{stat.value}</div>
              {stat.tone && <Badge tone={stat.tone}>{stat.note}</Badge>}
            </Card>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}

export function WorkflowTable({ columns, rows, renderCell }) {
  return <Card><Table columns={columns} rows={rows} renderCell={renderCell} /></Card>;
}

export function PrimaryAction({ children, icon, ...props }) {
  return <Button icon={<Icon name={icon} size={18} />} {...props}>{children}</Button>;
}
