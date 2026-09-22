import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { addMaterial } from '../../database/materials';
import { useToast } from '../../hooks/useToast';
import { formatSize } from '../../utils/file';

const MAX_FILE_SIZE = 150 * 1024 * 1024;

interface AddMaterialFormProps {
  subjectId: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function AddMaterialForm({ subjectId, onSaved, onCancel }: AddMaterialFormProps) {
  const { show } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (f && !name.trim()) {
      const base = f.name.replace(/\.[^.]+$/, '');
      setName(base);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      show('Введите название материала', 'error');
      return;
    }
    if (!file) {
      show('Выберите файл', 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      show('Файл слишком большой (максимум 150 МБ)', 'error');
      return;
    }
    setBusy(true);
    try {
      await addMaterial({
        subjectId,
        name: n,
        description: description.trim(),
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        blob: file
      });
      show('Материал загружен', 'success');
      onSaved();
    } catch (err) {
      const name1 = err instanceof Error ? err.name : '';
      if (name1 === 'QuotaExceededError') {
        show('Файл слишком большой для хранилища браузера', 'error');
      } else {
        show('Не удалось загрузить материал', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field-label">Название материала *</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Конспект по теме 1"
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
          placeholder="Краткое описание материала"
        />
      </label>

      <div className="field">
        <span className="field-label">Файл *</span>
        <input
          ref={fileInput}
          type="file"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <div className="file-preview">{file.name} · {formatSize(file.size)}</div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Загрузка…' : 'Загрузить материал'}
        </button>
      </div>
    </form>
  );
}