
import test from 'ava';
import { launch, stop } from 'dynamodb-local';
import { DynamoItemOptions } from './options';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { DynamoItem } from './dynamo-item';

test.before('start dynamo', async t => {
    await t.notThrows(launch(8000, null, ['-inMemory', '-sharedDb']));
})

test.after('top dynamo', async t => {
    t.notThrows(() => stop(8000));
});

const client = new DynamoDB.DocumentClient({
    region: "eu-central-1",
    endpoint: "http://localhost:8000",
    accessKeyId: 'ID',
    secretAccessKey: 'Key',
});

const options: DynamoItemOptions = {
    name: 'Videos',
    tableName: 'Videos',
    hashKey: {
        name: 'id',
        type: 'N'
    },
};

const model = new DynamoItem<{ id: number }, { id: number, title: string }>(options, client);

test.serial('createTable', async t => {
    await t.notThrows(model.createTable());
    await t.notThrows(model.get({ id: 1 }));
})

test.serial('deleteTable', async t => {
    await t.notThrows(model.deleteTable());
    await t.throws(model.get({ id: 1 }), /non-existent table/, 'Table not deleted!');
})

test.serial('hashKey model', async t => {
    await t.notThrows(model.createTable());

    let video1 = await model.create({ id: 1, title: 'Title 1' });

    t.is(video1.id, 1);
    t.is(video1.title, 'Title 1');

    await t.throws(model.create({ id: 1, title: 'Title 1' }), /The conditional request failed/);

    video1 = await model.update({
        key: { id: 1 },
        set: { title: 'Title One' }
    });
    t.is(video1.title, 'Title One');

    let videos = await model.getItems([{ id: 1 }, { id: 2 }], { attributes: ['id'] });

    t.is(videos.length, 1);
    t.is(videos[0].id, 1);
    t.deepEqual(videos[0], { id: 1 });

    let video2 = await model.create({ id: 2, title: 'Title 2' });

    t.is(video2.id, 2);
    t.is(video2.title, 'Title 2');

    await model.delete({ id: 1 });

    videos = await model.getItems([{ id: 1 }, { id: 2 }], { attributes: ['id'] });

    t.is(videos.length, 1);
    t.is(videos[0].id, 2);

    await t.notThrows(model.deleteTable());
})