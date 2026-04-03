export const getInitials = (fullName: string) => {
  const words = fullName.trim().split(/\s+/);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
};