
export function isStringOrNumber(data: any) {
    return ['string', 'number'].includes(typeof data);
}

export function uniqByProp<T>(items: T[], prop: keyof T): T[] {
    const map: { [index: string]: any } = {}
    const list: T[] = []

    for (let item of items) {
        if (map[(<any>item)[prop]] === undefined) {
            map[(<any>item)[prop]] = 1;
            list.push(item)
        }
    }

    return list;
}

export function getDynamoDataType(data: any): 'S' | 'N' {
    const type = typeof data;
    if (type === 'string') {
        return 'S';
    }
    if (type === 'number') {
        return 'N';
    }
    throw new Error(`Invalid data type: ${type}`);
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
