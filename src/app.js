const express = require('express');
const i18next = require('i18next');
const UserRouter = require('./api/1.0/routers/UserRouter');
const i18nextBackend = require('i18next-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

const app = express();

app.use(i18nextMiddleware.handle(i18next));
app.use(express.json());
app.use(UserRouter);
app.use((err, req, res) => {
  console.log('App.js', err);
  const { status, message, success, validationErrors, error } = err;
  return res.status(status).send({
    message: req.t(message),
    success: success,
    validationErrors: validationErrors,
    error: error,
  });
});

module.exports = app;
