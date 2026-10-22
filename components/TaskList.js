import { EmptyState } from "./StateViews";
import TaskCard from "./TaskCard";

/** Renders task cards, or an appropriate empty state (no tasks vs. no filter matches). */
export default function TaskList({ tasks, totalCount, project, uid, nameOf, onEdit, onDelete, onStatusChange, onCreate }) {
  if (totalCount === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        message="Create the first task for this project to get started."
        action={
          <button type="button" className="btn btn-primary" onClick={onCreate}>
            New task
          </button>
        }
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks match your filters"
        message="Try a different search term or clear the filters."
      />
    );
  }

  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          project={project}
          uid={uid}
          nameOf={nameOf}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </ul>
  );
}
