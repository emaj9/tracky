//ex 2021-12-31
export function getYMD() {
  const today = new Date();
  return (
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1) +
    "-" +
    today.getDate()
  );
}

export const changing = (array, index, func) => {
  const copy = [...array];
  copy[index] = func(copy[index]);
  return copy;
};
