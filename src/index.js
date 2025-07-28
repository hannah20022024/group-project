const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const { initDb } = require('./db');
const routes = require('./routes');

const app = express();
const port = 3000;

app.use(express.json());
initDb();

const swaggerDocument = yaml.load('./src/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});