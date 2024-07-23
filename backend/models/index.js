// backend/models/index.js
const Sequelize = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize('session', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Disable logging
});

// Define User model
const User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
}, {
    tableName: 'users', 
    timestamps: false, 
});

// Define Session model
const Session = sequelize.define('Session', {
    session_id: {
        type: Sequelize.STRING(100),
        primaryKey: true,
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    expires: {
        type: Sequelize.DATE,
        allowNull: true, // Allow NULL initially
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP + INTERVAL 7 DAY'), // Default to 1 week from now
    },
    data: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false,
    }
}, {
    tableName: 'sessions', // Specify table name explicitly
    timestamps: false, // Disable timestamps
});

// Define associations
User.hasMany(Session, {
    foreignKey: 'user_id',
});
Session.belongsTo(User, {
    foreignKey: 'user_id',
});

module.exports = {
    sequelize,
    User,
    Session,
};
