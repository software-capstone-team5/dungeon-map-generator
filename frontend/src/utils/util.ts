export const nameOf = <T>(name: keyof T) => name;
export type valueOf<T> = T[keyof T];

interface hasID {
    id: string
}

export function compareByID(rc1: hasID, rc2: hasID): boolean {
    if (rc1.id === "" || rc2.id === "") {
        return false;
    }

    return rc1.id === rc2.id;
}