# Fuel — расчёт расхода топлива

Одностраничный калькулятор: вводите пробег по одометру, распределяете его по нормам (линейная, трасса, областной центр), выбираете температуру «+» или «−» и получаете расход в литрах.

Данные сохраняются в браузере (localStorage). Сервера и сборки не нужны: это обычные HTML, CSS и JS.

## Структура

```
.
├── src/                     # весь сайт (его и публикуем)
│   ├── index.html           # разметка
│   ├── css/styles.css       # стили, светлая и тёмная темы
│   ├── js/
│   │   ├── config.js        # нормы расхода — менять здесь
│   │   └── app.js           # логика расчёта
│   └── assets/icons/        # favicon и иконка для iPhone
├── .github/workflows/
│   ├── deploy.yml           # публикация на GitHub Pages при пуше в main
│   └── build-apk.yml        # ручная сборка Android APK
├── capacitor.config.json    # оболочка для APK
├── package.json
├── CHANGELOG.md
└── README.md
```

## Как изменить нормы

Откройте `src/js/config.js` и поправьте числа. Порядок строк совпадает с блоками на странице.

## Запуск локально

Откройте `src/index.html` в браузере или выполните `npm start` (нужен Node.js).

## Публикация

1. Репозиторий → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Любой пуш в `main` публикует сайт: `https://<логин>.github.io/<репозиторий>/`.

Примечание: на бесплатном тарифе Pages работает только для публичных репозиториев.

## Android APK

**Actions → Build Android APK → Run workflow**. Готовый `app-debug.apk` появится в разделе Artifacts запуска.

## iPhone

Откройте сайт в Safari → «Поделиться» → «На экран "Домой"».
