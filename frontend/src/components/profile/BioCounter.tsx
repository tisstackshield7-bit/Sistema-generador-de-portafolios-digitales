type Props = {
  value: string;
};

export default function BioCounter({ value }: Props) {
  return (
    <p style={{ textAlign: "right", fontSize: "13px", color: "#64748b", marginTop: "-8px", marginBottom: "12px" }}>
      {value.length} / 500 caracteres
    </p>
  );
}