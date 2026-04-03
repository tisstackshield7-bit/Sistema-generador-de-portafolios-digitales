type Props = {
  message: string;
};

export default function AlertMessage({ message }: Props) {
  if (!message) return null;

  return (
    <div style={{
      background: "#fee2e2",
      color: "#991b1b",
      padding: "10px 12px",
      borderRadius: "8px",
      marginBottom: "12px",
      fontSize: "14px"
    }}>
      {message}
    </div>
  );
}