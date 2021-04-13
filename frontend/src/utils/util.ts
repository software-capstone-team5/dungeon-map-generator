export const nameOf = <T>(name: keyof T) => name;
export type valueOf<T> = T[keyof T];

interface hasID {
    id: string
}

interface hasName {
    name: string
}

export function compareByID(rc1: hasID, rc2: hasID): boolean {
    if (rc1.id === "" || rc2.id === "") {
        return false;
    }

    return rc1.id === rc2.id;
}

export function compareByName(rc1: hasName, rc2: hasName): boolean {
    return rc1.name === rc2.name;
}