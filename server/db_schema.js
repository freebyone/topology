// Описание структуры базы данных

const dbSchema = {
    // Коллекция "products"
    products: {
      fields: {
        _id: { type: "ObjectId", required: true }, // Уникальный идентификатор
        title: { type: "string", required: true }, // Название продукта
        description: { type: "string", required: true }, // Описание продукта
        image_url: { type: "string", required: false }, // Ссылка на изображение
        meta: {
          type: "object",
          fields: {
            keywords: { type: "array", required: false }, // Ключевые слова для SEO
            description: { type: "string", required: false }, // Мета-описание
          },
        },
        price: { type: "number", required: true }, // Цена продукта
        category: { type: "string", required: true }, // Категория продукта
        class: { type: "string", required: false }, // Класс продукта (подкатегория)
        discount: { type: "number", required: false }, // Скидка в процентах
      },
      indexes: [
        { fields: { title: 1 }, options: { unique: true } }, // Уникальный индекс для названия
        { fields: { category: 1 } }, // Индекс для категории
      ],
    },
  
    // Коллекция "users"
    users: {
      fields: {
        _id: { type: "ObjectId", required: true }, // Уникальный идентификатор
        FIO: { type: "string", required: true }, // ФИО пользователя
        phone: { type: "string", required: true }, // Телефон пользователя
        email: { type: "string", required: true }, // Email пользователя
        telegram: { type: "string", required: false }, // Telegram username
      },
      indexes: [
        { fields: { email: 1 }, options: { unique: true } }, // Уникальный индекс для email
        { fields: { phone: 1 }, options: { unique: true } }, // Уникальный индекс для телефона
      ],
    },
  
    // Коллекция "feedback"
    feedback: {
      fields: {
        _id: { type: "ObjectId", required: true }, // Уникальный идентификатор
        name: { type: "string", required: true }, // Имя пользователя
        phone: { type: "string", required: true }, // Телефон пользователя
        email: { type: "string", required: true }, // Email пользователя
        product_id: { type: "ObjectId", required: false }, // Ссылка на продукт
        timestamp: { type: "date", required: true, default: "Date.now" }, // Время создания заявки
      },
      indexes: [
        { fields: { product_id: 1 } }, // Индекс для product_id
        { fields: { timestamp: -1 } }, // Индекс для сортировки по времени
      ],
    },
  };
  
  module.exports = dbSchema;