// backend/server.js
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors()); 

// Session store
const sessionStore = new SequelizeStore({
    db: sequelize,
});

// Session middleware
app.use(session({
    secret: 'e4752f73206d3529865c56ed480c6811673103cf23847c5951570aa84b039f0f465b63b6c2109a1cdca8aaea27403160667366b68cc04c5cf5c14b72dc96849a',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
}));

// Routes
app.use('/auth', authRoutes);

// Sync Sequelize models and start server
sequelize.sync().then(() => {
    console.log('Database & tables synced');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
