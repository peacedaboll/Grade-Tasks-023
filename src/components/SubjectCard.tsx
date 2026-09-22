import type { Subject } from '../types';
import { Link } from '../utils/router';

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <article className="subject-card">
      <div className="subject-card-top">
        <span className="subject-code">{subject.code}</span>
      </div>
      <h3 className="subject-name">{subject.name}</h3>
      <p className="subject-info">{subject.shortInfo}</p>
      <Link to={`/subject/${encodeURIComponent(subject.id)}`} className="btn btn-primary btn-block">
        Открыть
      </Link>
    </article>
  );
}