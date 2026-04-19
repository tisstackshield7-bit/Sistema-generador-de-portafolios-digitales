type Props = {
  count: number;
  limit?: number;
};

export default function BioCounter({ count, limit = 500 }: Props) {
  return <p className="counter-text">{count} / {limit} caracteres</p>;
}
