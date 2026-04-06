type Props = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

export default function FormInput({
  label,
  type = "text",
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
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: error ? "1px solid #dc2626" : "1px solid #d1d5db",
        }}
      />
      {error && <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "6px" }}>{error}</p>}
    </div>
  );
}