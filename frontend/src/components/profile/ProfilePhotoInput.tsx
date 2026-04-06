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
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
        Foto de perfil (opcional)
      </label>

      {preview && (
        <img
          src={preview}
          alt="Vista previa"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            marginBottom: "12px",
          }}
        />
      )}

      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleChange} />

      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "6px" }}>
        JPG, PNG o WEBP - máximo 5 MB
      </p>

      {error && <p style={{ color: "#dc2626", fontSize: "13px" }}>{error}</p>}
    </div>
  );
}