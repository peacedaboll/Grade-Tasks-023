import { useState } from 'react';
import type { Material } from '../../types';
import { deleteMaterial } from '../../database/materials';
import { useToast } from '../../hooks/useToast';
import { canPreview, downloadBlob, extLabel, formatSize, openBlob } from '../../utils/file';
import { formatDate } from '../../utils/dates';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { AddMaterialForm } from '../../components/forms/AddMaterialForm';

interface MaterialsTabProps {
  subjectId: string;
  materials: Material[];
  admin: boolean;
  onChanged: () => void;
}

export function MaterialsTab({ subjectId, materials, admin, onChanged }: MaterialsTabProps) {
  const { show } = useToast();
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = async (m: Material) => {
    if (!window.confirm(`Удалить материал «${m.name}»?`)) return;
    try {
      await deleteMaterial(m.id);
      show('Материал удалён', 'success');
      onChanged();
    } catch {
      show('Не удалось удалить материал', 'error');
    }
  };

  if (materials.length === 0) {
    return (
      <EmptyState
        icon="🗂"
        title="Материалов пока нет"
        subtitle="Загрузите первый материал — файл сохранится в браузере и будет доступен офлайн."
      >
        {admin && (
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Добавить материал
          </button>
        )}
        {showAdd && (
          <Modal title="Загрузить материал" onClose={() => setShowAdd(false)}>
            <AddMaterialForm
              subjectId={subjectId}
              onSaved={() => {
                setShowAdd(false);
                onChanged();
              }}
              onCancel={() => setShowAdd(false)}
            />
          </Modal>
        )}
      </EmptyState>
    );
  }

  return (
    <section className="materials-section">
      <div className="section-head">
        <div>
          <h2>Материалы</h2>
          <p className="muted">Всего материалов: {materials.length}</p>
        </div>
        {admin && (
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Добавить материал
          </button>
        )}
      </div>

      <div className="material-grid">
        {materials.map((m) => (
          <article key={m.id} className="material-card">
            <div className="material-top">
              <span className="material-ext">{extLabel(m.fileName)}</span>
            </div>
            <h3 className="material-name" title={m.fileName}>
              {m.name}
            </h3>
            {m.description && <p className="material-desc">{m.description}</p>}
            <div className="material-meta">
              <span>{m.fileName}</span>
              <span>
                {formatSize(m.fileSize)} · {formatDate(m.createdAt)}
              </span>
            </div>
            <div className="material-actions">
              {canPreview(m.fileName) ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openBlob(m.blob)}>
                  👁 Открыть
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => downloadBlob(m.blob, m.fileName)}
              >
                ⬇ Скачать
              </button>
              {admin && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(m)}
                >
                  Удалить
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {showAdd && (
        <Modal title="Загрузить материал" onClose={() => setShowAdd(false)}>
          <AddMaterialForm
            subjectId={subjectId}
            onSaved={() => {
              setShowAdd(false);
              onChanged();
            }}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
    </section>
  );
}