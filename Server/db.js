const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '28494217',
    database: 'Chama_Vault'
};
// Export the connection function directly
module.exports = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('connected to mysql database');
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error; // Re-throw the error so it can be caught in index.js
    }
};