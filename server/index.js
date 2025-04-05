require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(bodyParser.json());

app.use(cors());

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const PORT = process.env.PORT || 3000; // Используем порт из .env или 3000 по умолчанию

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Функция для подключения к MongoDB
async function connectToMongo() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    return client.db(DB_NAME);
}

// Обработчик POST-запроса для заявок
app.post('/submit-form', async (req, res) => {
    const { name, phone, email, productId } = req.body;

    // Сообщение для отправки в Telegram
    const message = `
    Новая заявка:
    Имя: ${name}
    Телефон: ${phone}
    Email: ${email}
    Номер продукта: ${productId}
    `;

    try {
        // Сохраняем заявку в MongoDB
        const db = await connectToMongo();
        const feedbackCollection = db.collection(COLLECTION_NAME);

        const feedbackData = {
            name,
            phone,
            email,
            productId,
            timestamp: new Date() // Добавляем метку времени
        };

        await feedbackCollection.insertOne(feedbackData);

        // Отправляем сообщение в Telegram
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        if (response.data.ok) {
            res.status(200).send('Заявка успешно отправлена и сохранена!');
        } else {
            throw new Error('Ошибка отправки в Telegram');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Произошла ошибка при отправке заявки');
    }
});

// Обработчик POST-запроса для добавления продукта
app.post('/add-product', async (req, res) => {
    const { title, description, price, category } = req.body;

    try {
        const db = await connectToMongo();
        const productsCollection = db.collection('products');

        const productData = {
            title,
            description,
            price,
            category,
            timestamp: new Date()
        };

        await productsCollection.insertOne(productData);
        res.status(200).send('Продукт успешно добавлен!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Произошла ошибка при добавлении продукта');
    }
});

// Обработчик GET-запроса для получения всех продуктов
app.get('/products', async (req, res) => {
    try {
        const db = await connectToMongo();
        const productsCollection = db.collection('products');

        // Получаем все продукты из коллекции
        const products = await productsCollection.find({}).toArray();

        // Возвращаем список продуктов
        res.status(200).json(products);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Произошла ошибка при получении списка продуктов');
    }
});

app.get('/feedback', async (req, res) => {
    try {
        const db = await connectToMongo();
        const feedbackCollection = db.collection('feedback');

        // Получаем все заявки из коллекции
        const feedback = await feedbackCollection.find({}).toArray();

        // Возвращаем список заявок
        res.status(200).json(feedback);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Произошла ошибка при получении списка заявок');
    }
});
// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Создаем клавиатуру с тремя кнопками
    const options = {
        reply_markup: {
            keyboard: [
                [{ text: '1 - Добавить продукт' }],
                [{ text: '2 - Вывести все заявки' }],
                [{ text: '3 - Вывести все продукты' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    };

    bot.sendMessage(chatId, 'Выберите действие:', options);
});

// Обработка нажатий на кнопки
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '1 - Добавить продукт') {
        // Запрашиваем данные для добавления продукта
        bot.sendMessage(chatId, 'Введите данные продукта в формате JSON:\n\n' +
            '{\n' +
            '  "title": "Название продукта",\n' +
            '  "description": "Описание продукта",\n' +
            '  "price": 100,\n' +
            '  "category": "Категория продукта",\n' +
            '  "class_product": "Класс продукта",\n' +
            '  "image_url": "./image.jpg",\n' +
            '  "discount": 10\n' +
            '}');
    } else if (text.startsWith('{')) {
        // Если пользователь ввел JSON, добавляем продукт
        try {
            const productData = JSON.parse(text);

            // Отправляем данные на сервер
            const response = await axios.post('http://localhost:3000/add-product', productData);

            if (response.status === 200) {
                bot.sendMessage(chatId, 'Продукт успешно добавлен!');
            } else {
                bot.sendMessage(chatId, 'Ошибка при добавлении продукта.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Ошибка при обработке данных: ' + error.message);
        }
    } else if (text === '2 - Вывести все заявки') {
        // Запрашиваем все заявки
        try {
            const response = await axios.get('http://localhost:3000/feedback');
            const feedback = response.data;

            if (feedback.length > 0) {
                let message = 'Список заявок:\n\n';
                feedback.forEach((item, index) => {
                    message += `Заявка #${index + 1}:\n` +
                        `Имя: ${item.name}\n` +
                        `Телефон: ${item.phone}\n` +
                        `Email: ${item.email}\n` +
                        `ID продукта: ${item.product_id}\n` +
                        `Дата: ${item.timestamp}\n\n`;
                });

                bot.sendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, 'Заявок нет.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Ошибка при получении заявок: ' + error.message);
        }
    } else if (text === '3 - Вывести все продукты') {
        // Запрашиваем все продукты
        try {
            const response = await axios.get('http://localhost:3000/products');
            const products = response.data;

            if (products.length > 0) {
                let message = 'Список продуктов:\n\n';
                products.forEach((item, index) => {
                    message += `Продукт #${index + 1}:\n` +
                        `Название: ${item.title}\n` +
                        `Описание: ${item.description}\n` +
                        `Цена: ${item.price}\n` +
                        `Категория: ${item.category}\n` +
                        `Класс: ${item.class_product}\n` +
                        `Скидка: ${item.discount}%\n` +
                        `Изображение: ${item.image_url}\n` +
                        `Дата: ${item.timestamp}\n\n`;
                });

                bot.sendMessage(chatId, message);
            } else {
                bot.sendMessage(chatId, 'Продуктов нет.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Ошибка при получении продуктов: ' + error.message);
        }
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});