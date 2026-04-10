type Props = {
  value: string;
};

export default function BioCounter({ value }: Props) {
  return <p className="counter-text">{value.length} / 500 caracteres</p>;
}

