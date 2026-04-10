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
    <div className="form-field">
      <label className="form-label">{label}</label>
      <textarea
        className={`form-textarea${error ? " error" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

