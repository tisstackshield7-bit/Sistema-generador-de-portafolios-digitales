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
    <div className="form-field">
      <label className="form-label">{label}</label>
      <input
        className={`form-input${error ? " error" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

