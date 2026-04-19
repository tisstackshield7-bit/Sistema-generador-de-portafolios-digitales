type Props = {
  message: string;
};

export default function AlertMessage({ message }: Props) {
  if (!message) return null;

  return <div className="alert-message">{message}</div>;
}

