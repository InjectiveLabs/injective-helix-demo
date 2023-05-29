# 🌟 Injective Helix

_Helix | Перша децентралізована спотова та деривативна біржа_

[Ознайомтеся з інтерфейсом користувача](https://helixapp.com)

## ✨ Особливості

- Сучасний і інтуїтивно зрозумілий дизайн
- Торгуйте з легкістю та гнучкістю
- Новітні розробки та технології безпеки
- Приємний у використанні!

---

## 📚 Початок роботи

1. Клонуйте репозиторій

```bash
$ git clone git@github.com:InjectiveLabs/injective-dex.git
$ cd injective-dex
$ yarn
```

2. Створіть копію .env.example to .env і заповніть значення
3. Скомпілюйте додаток локально

```bash
$ yarn dev
```

## 📖 Документація

`Injective-helix` побудовано з використанням Nuxt і TailwindCSS, а працює він на основі [injective-ts monorepo](https://github.com/InjectiveLabs/injective-ts/).

Ви завжди можете завантажити dex локально на власному ноутбуці без необхідності встановлювати ретранслятор. Ви можете використати мережу `public`  у конфігураційній змінній `VITE_NETWORK` `.env` і виконати команду `yarn run dev`. Ви можете знайти всі доступні мережі (тобто - попередньо визначений набір кінцевих точок) [тут](https://github.com/InjectiveLabs/injective-ts/blob/17b1aa5df39d5724baf6262b276980cf722a1cba/packages/networks/src/types.ts#L1). Використання цих кінцевих точок (з мережі `public`) дає 40% від комісії за торгівлю в пул спільноти.

### Розгортання

`injective-helix`  використовує AWS для розгортання. В файлі  `.github/workflow/mainnet.yml` встановлено CD-пайплайн.  Розгортання на AWS виконується в кошик S3, який обслуговується через Cloudfront до кінцевого користувача. Використовуючи `yarn generate`, ми генеруємо статичні html-сторінки, які обслуговуються через cloud front.

Більше деталей про те, як розгорнути проект Nuxt, можна знайти в їхній документації.


### Перехід на Nuxt3

Ми перенесли репо `injective-helix` на Nuxt3 у січні 2023 року. Щоб здійснити перехід на вашому форку, потрібно виконати кілька простих кроків:

1. Отримайте останню версію коду з репозиторію `injective-dex`, гілка `master`
2. Вирішіть конфлікти злиття у вашому форку.
3. Встановіть залежності `yarn install`
4. Очистіть залишки від попередніх розгортань `yarn clean-up && rm -rf dist`
5. Оновіть ваш файл `.env` і додайте префікс `VITE_` до всіх змінних `.env` 
6. Запустіть dex `yarn dev` 

---

## ⛑ Підтримка

Зв'яжіться з нами за однією з наступних адрес!

- Сайт <a href="https://injective.com" target="_blank">`injective.com`</a>
- Сайт <a href="https://injectivelabs.org" target="_blank">`injectivelabs.org`</a>
- Твіттер <a href="https://twitter.com/Injective_" target="_blank">`@Injective`</a>
- Твіттер <a href="https://twitter.com/InjectiveLabs" target="_blank">`@InjectiveLabs`</a>
- Діскорд <a href="https://discord.com/invite/NK4qdbv" target="_blank">`Injective Discord`</a>
- Телеграм <a href="https://t.me/joininjective" target="_blank">`Injective Telegram`</a>
- Телеграм <a href="https://t.me/helixapp" target="_blank">`Helix Telegram`</a>

---

## 🔓 Ліцензія

Авторські права © 2021 - 2022 Injective Labs Inc. (https://injectivelabs.org/)

<a href="https://iili.io/mNneZN.md.png"><img src="https://iili.io/mNneZN.md.png" style="width: 300px; max-width: 100%; height: auto" />

Оригінально видано Injective Labs Inc. за: <br />
Ліцензія Apache <br />
Версія  2.0, січень 2004 <br />
http://www.apache.org/licenses/

<p>&nbsp;</p>
<div align="center">
  <sub><em>Забезпечуємо майбутнє децентралізованих фінансів.</em></sub>
</div>
