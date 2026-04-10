import type { ChangeEvent } from "react";

type Props = {
  preview: string | null;
  error?: string;
  onFileChange: (file: File | null) => void;
};

export default function ProfilePhotoInput({ preview, error, onFileChange }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
  };

  return (
    <div className="form-field photo-input">
      <label className="form-label">Foto de perfil</label>
      <div className="photo-preview-row">
        {preview ? (
          <img src={preview} alt="Vista previa" className="photo-preview" />
        ) : (
          <div className="photo-preview photo-empty">PF</div>
        )}
        <div>
          <p className="section-copy">Agrega una imagen clara para que tu perfil se vea mas profesional.</p>
          <p className="form-help">JPG, PNG o WEBP. Tamano maximo de 5 MB.</p>
        </div>
      </div>
      <input className={`form-file${error ? " error" : ""}`} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleChange} />
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

