
export type TableName = (() => string) | string;

export interface DynamoItemOptions {
    name: string
    tableName: TableName
    hashKey: DynamoItemKey
    rangeKey?: DynamoItemKey
    indexes?: DynamoItemIndex[]
}

export type DynamoItemIndex = {
    name: string
    type: 'LOCAL' | 'GLOBAL'
    hashKey: DynamoItemKey
    rangeKey?: DynamoItemKey
    projection?: DynamoItemIndexProjection
    throughput?: ProvisionedThroughput
}

export type ProvisionedThroughput = {
    read: number
    write: number
}

export type DynamoItemIndexProjection = {
    include?: string[]
    type: 'KEYS_ONLY' | 'INCLUDE' | 'ALL'
}

export type DynamoItemKey = {
    name: string
    type: 'S' | 'N'
}
