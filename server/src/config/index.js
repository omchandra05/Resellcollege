require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5050,
    DB_URL: process.env.DB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
};