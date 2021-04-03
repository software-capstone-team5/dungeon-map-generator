export const nameOf = <T>(name: keyof T) => name;
export type valueOf<T> = T[keyof T];