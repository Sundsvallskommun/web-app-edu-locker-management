export const autoNumber = (name: string, index: number) => {
  const endWithNumber = new RegExp(/\d+$/);
  const ending = endWithNumber.test(name) ? endWithNumber.exec(name)?.at(-1) : undefined;
  const number = ending ? parseInt(ending, 10) + index : 1 + index;

  return ending ? `${name.substring(0, name.length - ending.length)}${number}` : `${name}${number}`;
};
