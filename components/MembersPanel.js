import Link from "next/link";

/** Read-only member list shown on the project page. */
export default function MembersPanel({ project, nameOf, isProjectOwner }) {
  return (
    <section className="card" aria-labelledby="members-heading">
      <div className="card-head">
        <h2 id="members-heading">Members ({project.memberIds.length})</h2>
        {isProjectOwner ? (
          <Link className="btn btn-small" href={`/projects/${project.id}/settings`}>
            Manage members
          </Link>
        ) : null}
      </div>
      <ul className="chip-list">
        {project.memberIds.map((uid) => (
          <li key={uid} className="chip">
            {nameOf(uid)}
            {uid === project.ownerId ? <span className="chip-tag">Owner</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
