require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const IP_ADDRESS_DB = process.env.IP_ADDRESS_DB;
const MONGO_PORT = process.env.MONGO_PORT;

async function createUserWithReadWriteAccess() {
    let client;
    try {
        // Подключаемся к MongoDB
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('Подключено к MongoDB для создания пользователя');

        // Переходим в базу данных admin
        const adminDb = client.db('admin');

        // Создаем пользователя с правами на чтение и запись
        await adminDb.command({
            createUser: USERNAME,
            pwd: PASSWORD,
            roles: [{ role: 'readWrite', db: DB_NAME }]
        });
        console.log(`Пользователь "${USERNAME}" создан с правами на чтение и запись`);
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
    } finally {
        // Закрываем подключение
        if (client) {
            await client.close();
        }
    }
}

async function connectAndTest() {
    let client;
    try {
        // Подключаемся к MongoDB с использованием нового пользователя
        const AUTH_URI = `mongodb://${USERNAME}:${PASSWORD}@${IP_ADDRESS_DB}:${MONGO_PORT}/${DB_NAME}?authSource=admin`;
        client = new MongoClient(AUTH_URI);
        await client.connect();
        console.log('Подключено к MongoDB с аутентификацией');

        // Переходим в базу данных
        const db = client.db(DB_NAME);

        // Получаем коллекцию
        const collection = db.collection(COLLECTION_NAME);

        // Тестовая запись
        const testDocument = { message: 'Это тестовый документ', timestamp: new Date() };
        const insertResult = await collection.insertOne(testDocument);
        console.log('Документ добавлен:', insertResult.insertedId);

        // Тестовое чтение
        const foundDocument = await collection.findOne({ _id: insertResult.insertedId });
        console.log('Найден документ:', foundDocument);
    } catch (error) {
        console.error('Ошибка при подключении или выполнении операций:', error);
    } finally {
        // Закрываем подключение
        if (client) {
            await client.close();
        }
    }
}

// Основная функция
(async () => {
    // Создаем пользователя
    await createUserWithReadWriteAccess();

    // Подключаемся и тестируем
    await connectAndTest();
})();