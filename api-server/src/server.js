const app = require('./index');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/api/docs`);
});
