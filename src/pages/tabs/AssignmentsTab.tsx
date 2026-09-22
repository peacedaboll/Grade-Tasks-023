import { useState } from 'react';
import type { GradeWork, Material } from '../../types';
import { deleteWork } from '../../database/works';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/dates';
import { downloadBlob } from '../../utils/file';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { AddWorkForm } from '../../components/forms/AddWorkForm';

interface AssignmentsTabProps {
  subjectId: string;
  works: GradeWork[];
  materials: Material[];
  admin: boolean;
  onChanged: () => void;
}

export function AssignmentsTab({ subjectId, works, materials, admin, onChanged }: AssignmentsTabProps) {
  const { show } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<GradeWork | null>(null);

  const handleDelete = async (work: GradeWork) => {
    if (!window.confirm(`Удалить задание «${work.title}»?`)) return;
    try {
      await deleteWork(work.id);
      show('Задание удалено', 'success');
      onChanged();
    } catch {
      show('Не удалось удалить задание', 'error');
    }
  };

  const openModal = (work: GradeWork | null) => {
    if (work) setEditing(work);
    else setEditing(null);
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(null);
  };

  if (works.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="Заданий пока нет"
        subtitle="Добавьте задание — оно станет колонкой журнала и появится в блоке заданий."
      >
        {admin && (
          <button type="button" className="btn btn-primary" onClick={() => openModal(null)}>
            + Добавить задание
          </button>
        )}
        {showAdd && (
          <Modal title={editing ? 'Редактировать задание' : 'Новое задание'} onClose={closeModal}>
            <AddWorkForm
              subjectId={subjectId}
              materials={materials}
              work={editing ?? undefined}
              onSaved={() => {
                closeModal();
                onChanged();
              }}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </EmptyState>
    );
  }

  return (
    <section className="assignments-section">
      <div className="section-head">
        <div>
          <h2>Задания</h2>
          <p className="muted">Всего заданий: {works.length}</p>
        </div>
        {admin && (
          <button type="button" className="btn btn-primary" onClick={() => openModal(null)}>
            + Добавить задание
          </button>
        )}
      </div>

      <div className="assignment-list">
        {works.map((w) => {
          const material = w.materialId ? materials.find((m) => m.id === w.materialId) : undefined;
          return (
            <article key={w.id} className="assignment-card">
              <div className="assignment-main">
                <h3>{w.title}</h3>
                {w.description && <p className="assignment-desc">{w.description}</p>}
                <div className="assignment-meta">
                  <span>📅 Дата: {formatDate(w.date)}</span>
                  <span>⏰ Срок: {formatDate(w.deadline)}</span>
                  {w.maxGrade !== 5 && <span>🎯 Макс. оценка: {w.maxGrade}</span>}
                </div>
                {material && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => downloadBlob(material.blob, material.fileName)}
                    title={`Скачать: ${material.fileName}`}
                  >
                    📎 {material.name}
                  </button>
                )}
              </div>
              {admin && (
                <div className="assignment-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => openModal(w)}>
                    ✏️ Изменить
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(w)}
                  >
                    Удалить
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showAdd && (
        <Modal title={editing ? 'Редактировать задание' : 'Новое задание'} onClose={closeModal}>
          <AddWorkForm
            subjectId={subjectId}
            materials={materials}
            work={editing ?? undefined}
            onSaved={() => {
              closeModal();
              onChanged();
            }}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </section>
  );
}