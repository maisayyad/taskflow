import { priorityInfo, statusInfo } from "@/lib/tasks";

// Status and priority are shown with a text label AND a symbol, never colour alone (section 8).

export function StatusBadge({ status }) {
  const info = statusInfo(status);
  return (
    <span className={`badge status-${info.value}`}>
      <span aria-hidden="true">{info.symbol}</span> {info.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const info = priorityInfo(priority);
  return (
    <span className={`badge priority-${info.value}`}>
      <span aria-hidden="true">{info.symbol}</span> {info.label} priority
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span className="badge overdue">
      <span aria-hidden="true">!</span> Overdue
    </span>
  );
}

export function RoleBadge({ owner }) {
  return <span className="badge role">{owner ? "Owner" : "Member"}</span>;
}
