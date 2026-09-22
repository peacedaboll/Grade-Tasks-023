import { useState } from 'react';
import type { FormEvent } from 'react';
import type { GradeWork, Material } from '../../types';
import { addWork, updateWork } from '../../database/works';
import { useToast } from '../../hooks/useToast';
import { todayIso } from '../../utils/dates';

interface AddWorkFormProps {
  subjectId: string;
  materials: Material[];
  work?: GradeWork;
  onSaved: () => void;
  onCancel: () => void;
}

export function AddWorkForm({ subjectId, materials, work, onSaved, onCancel }: AddWorkFormProps) {
  const { show } = useToast();
  const [title, setTitle] = useState(work?.title ?? '');
  const [description, setDescription] = useState(work?.description ?? '');
  const [date, setDate] = useState(work?.date ?? todayIso());
  const [deadline, setDeadline] = useState(work?.deadline ?? '');
  const [maxGrade, setMaxGrade] = useState(work?.maxGrade ?? 5);
  const [materialId, setMaterialId] = useState(work?.materialId ?? '');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      show('Введите название задания', 'error');
      return;
    }
    setBusy(true);
    try {
      const data = {
        subjectId,
        title: t,
        description: description.trim(),
        date,
        deadline,
        maxGrade,
        materialId: materialId || undefined
      };
      if (work) {
        await updateWork({ ...work, ...data });
      } else {
        await addWork(data);
      }
      show(work ? 'Задание обновлено' : 'Задание добавлено', 'success');
      onSaved();
    } catch {
      show('Не удалось сохранить данные', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field-label">Название *</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Практическая работа №3"
          autoFocus
          maxLength={200}
        />
      </label>

      <label className="field">
        <span className="field-label">Описание</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Краткое описание задания"
        />
      </label>

      <div className="form-row">
        <label className="field">
          <span className="field-label">Дата</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">Срок сдачи</span>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span className="field-label">Максимальная оценка</span>
          <select value={String(maxGrade)} onChange={(e) => setMaxGrade(Number(e.target.value))}>
            {[2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Прикреплённый материал</span>
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
            <option value="">Без материала</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Сохранение…' : work ? 'Сохранить' : 'Добавить задание'}
        </button>
      </div>
    </form>
  );
}