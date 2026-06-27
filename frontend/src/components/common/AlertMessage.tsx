interface AlertMessageProps {
  message?: string | null;
}

export default function AlertMessage({ message }: AlertMessageProps) {
  if (!message) return null;

  return (
    <div className="alert-message" role="alert" dangerouslySetInnerHTML={{ __html: message }} />
  );
}
