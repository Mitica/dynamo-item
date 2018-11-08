
export function isStringOrNumber(data: any) {
    return ['string', 'number'].includes(typeof data);
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
