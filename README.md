# Bakery Asset Management

This project is a part of [Databases I course](https://maurus.ttu.ee/aine_index.php?aine=388).

## Setup and launch locally

1. Create a `database.db` file in the root of the repository.
2. Run `setup.sql` migrations

These steps can be done using the following
```sh
sqlite3 database.db < setup.sql
```
Although I haven't tested it (yet).

3. Install dependencies `pnpm install`
4. Build the project `pnpm build`
5. Run the preview server `pnpm start`

---
To do all the above you need:
* sqlite3 cli or any other tool to run `setup.sql`
* node.js
* pnpm

## If you want to sign in
Just use my school email and this fancy password:
```
pamayo@taltech.ee
webarebears
```

This can be also found from `setup.sql` script.

## Tech
Modern yet simple stack:
* [Astro](https://astro.build)
* [Typescript](https://www.typescriptlang.org/)
* [TailwindCSS](https://tailwindcss.com)

Enormous amount of inspiration for implementing proper auth was sourced from [The Copenhagen Book](https://thecopenhagenbook.com/) and [Lucia](https://lucia-auth.com/).

## Documentation
Extensive documentation can be found at this [link](https://livettu-my.sharepoint.com/:b:/g/personal/pamayo_taltech_ee/ETgwdRqrmb9LviVjzjTIjAAB8C3mBOjdZqhE3iCV02L7jA?e=IUt6ay) (expires April 2026).

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
