const app = require('./app');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Sync database and start server
async function startServer() {
  try {
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();