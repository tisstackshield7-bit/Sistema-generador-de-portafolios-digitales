type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export default function FormTextarea({
  label,
  value,
  onChange,
  error,
  placeholder,
}: Props) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
        {label}
      </label>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
          resize: "none",
        }}
      />

      {error && (
        <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>
          {error}
        </p>
      )}
    </div>
  );
}