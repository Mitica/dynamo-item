
const debug = require('debug')('dynamo-model');

import {
    BaseDynamoModel,
    ModelDataType,
    ModelUpdateData,
    ModelDataKey,
} from './base-dynamo-model';

import {
    getItemInput,
    batchGetItemInput,
    putItemInput,
    deleteItemInput,
    createItemInput,
    queryInput,
    updateItemInput,
    UpdateItemParams,
    UpdateExpressionSet,
} from 'dynamo-input';

export interface DynamoModelReadParams {
    attributes?: string[]
}

export class DynamoModel<KEY extends ModelDataKey, T extends ModelDataType> extends BaseDynamoModel<T> {

    async get(key: KEY, params?: DynamoModelReadParams): Promise<T | null> {
        const input = getItemInput({
            tableName: this.tableName(),
            key,
            attributes: params && params.attributes,
        });

        debug('get params:', input);

        const result = await this.client.get(input).promise();

        if (!result.Item) {
            return null;
        }

        return result.Item as T;
    }

    async getItems(keys: KEY[], params?: DynamoModelReadParams): Promise<T[]> {
        const tableName = this.tableName();
        const input = batchGetItemInput({
            tableName: tableName,
            keys,
            attributes: params && params.attributes,
        });

        debug('getItems params:', input.RequestItems);

        const result = await this.client.batchGet(input).promise();

        if (!result.Responses || !result.Responses) {
            return [];
        }

        const items = result.Responses[tableName] || [];

        return items.map(item => item as T);
    }

    async put(item: T): Promise<T> {
        item = this.beforeCreate(item);

        const input = putItemInput({
            tableName: this.tableName(),
            item: item,
        });

        debug('putting item with params:', input);

        await this.client.put(input).promise();

        return item;
    }

    /**
     * Deletes an item by key.
     * @param key Item key
     * @returns Deleted item or null if no one exists with current key.
     */
    async delete(key: KEY): Promise<T | null> {
        const input = deleteItemInput({
            tableName: this.tableName(),
            key,
        });

        input.ReturnValues = 'ALL_OLD';

        debug('deleting item with params:', input);

        const result = await this.client.delete(input).promise();

        if (!result.Attributes) {
            return null;
        }

        return result.Attributes as T;
    }

    /**
     * Creates a new item and throws if any exists with same key.
     * @param item Item to create
     */
    async create(item: T): Promise<T> {
        item = this.beforeCreate(item);

        const input = createItemInput({
            tableName: this.tableName(),
            hashKeyName: this.options.hashKey.name,
            rangeKeyName: this.options.rangeKey && this.options.rangeKey.name,
            item: item,
        });

        input.ReturnValues = 'NONE';

        debug('creating item with params:', input);

        await this.client.put(input).promise();

        return item;
    }

    /**
     * Updates an existing item and throws on not existing.
     * @param data Update data
     */
    async update(data: ModelUpdateData<T>): Promise<T> {
        data = this.beforeUpdate(data);

        const params: UpdateItemParams = {
            tableName: this.tableName(),
            key: data.key,
            hashKeyName: this.options.hashKey.name,
            remove: data.remove as string[] | undefined,
        };

        if (data.set) {
            const set: { [key: string]: UpdateExpressionSet } = {};
            for (const key of Object.keys(data.set)) {
                if (key === this.options.hashKey.name || this.options.rangeKey && this.options.rangeKey.name === key) {
                    continue;
                }
                set[key] = {
                    value: (<any>data.set)[key]
                };
            }
            params.set = set;
        }

        const input = updateItemInput(params);

        input.ReturnValues = 'ALL_NEW';

        debug('updating item with params:', input);

        const result = await this.client.update(input).promise();

        if (!result.Attributes) {
            throw new Error(`Somethig goes wrong!`);
        }

        return result.Attributes as T;
    }

    async query(params: DynamoQueryParams): Promise<DynamoQueryResult<T>> {

        const rangeKey = params.rangeKey && {
            name: this.getRangeKeyName(params.index),
            operation: params.rangeKey.operation,
            value: params.rangeKey.value,
        };

        const input = queryInput({
            tableName: this.tableName(),
            hashKey: {
                name: this.getHashKeyName(params.index),
                value: params.hashKey,
            },
            select: params.select,
            attributes: params.attributes,
            consistentRead: params.consistentRead,
            index: params.index,
            limit: params.limit,
            startKey: params.startKey,
            rangeKey,
            order: params.order,
        });

        debug('query with params:', input);

        const result = await this.client.query(input).promise();

        const data: DynamoQueryResult<T> = {
            count: result.Count || result.Items && result.Items.length || 0
        };

        if (result.Items) {
            data.items = result.Items.map(item => item as T);
        }

        return data;
    }
}

export type DynamoQueryResult<T> = {
    items?: T[]
    count: number
}

export interface DynamoQueryParams {
    hashKey: string | number
    rangeKey?: DynamoQueryRangeKey
    index?: string
    select?: 'COUNT' | 'ALL_PROJECTED_ATTRIBUTES' | 'ALL_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES'
    attributes?: string[]
    limit?: number
    consistentRead?: boolean
    startKey?: { [key: string]: any }
    order?: 'ASC' | 'DESC'
}

export type DynamoQueryRangeKey = {
    operation: '=' | '<>' | '<' | '<=' | '>' | '>=' | 'IN' | 'BETWEEN' | 'begins_with'
    value: number | string | string[] | number[]
}

export type DynamoQueryKey = { [key: string]: string | number }

// export type ComparisonOperator = "EQ" | "NE" | "IN" | "LE" | "LT" | "GE" | "GT" | "BETWEEN" | "NOT_NULL" | "NULL" | "CONTAINS" | "NOT_CONTAINS" | "BEGINS_WITH";

