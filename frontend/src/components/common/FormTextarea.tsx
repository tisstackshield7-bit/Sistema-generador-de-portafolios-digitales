type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  showCounter?: boolean;
};

export default function FormTextarea({
  label,
  value,
  onChange,
  error,
  placeholder,
  maxLength = 500,
  showCounter = true,
}: Props) {
  const currentLength = value?.length ?? 0;

  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <textarea
        className={`form-textarea${error ? " error" : ""}`}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
      />
      {error ? <p className="form-error">{error}</p> : null}
      {showCounter ? <p className="counter-text">{currentLength} / {maxLength} caracteres</p> : null}
    </div>
  );
}
