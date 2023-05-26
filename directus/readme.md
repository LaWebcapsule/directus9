<p>&nbsp;</p>

<a href="https://directus.io" target="_blank" rel="noopener noreferrer"><img width="250" alt="Logo" src="https://user-images.githubusercontent.com/9141017/88821768-0dc99800-d191-11ea-8c66-09c55ab451a2.png"></a>

<p>&nbsp;</p>

**This repository is a fork of the Directus 9. Directus 9 was under BSL license and so is this repository. As Directus 10 is now <i>a premium open-source software</i>, this repository aims to maintain a standard openSource version of Directus 9. This repository is not bound to the directus core team.**

## Scope of the fork

Our main goal with this repository is to release security updates and some fixes of the directus 9 version. All contributions are welcome.

:exclamation: :construction_worker: The documentation is provided in the state it was for the directus 9 version and has link toward the directus platform. However the directus platform is now in v10 and the informations you can find there may not be reliable for the v9. 


## Introduction


**Directus 9 is a free and open-source data platform for headless content management**. It can be installed on top of any
new or existing SQL database, instantly providing a dynamic API (REST+GraphQL) and accompanying App for managing
content. Built entirely in TypeScript (in Node and Vue), Directus is completely modular and end-to-end extensible...
with absolutely no paywalls or artificial limitations.

Modern and intuitive, the Directus App enables no-code data discovery, allowing for even the most non-technical users to
view, author, and manage your raw database content. Our performant and flexible API is able to adapt to any relational
schema, and includes rule-based permissions, event/web hooks, custom endpoints, numerous auth options, configurable
storage adapters, and much more.

Current database support includes: PostgreSQL, MySQL, SQLite, MS-SQL Server, OracleDB, MariaDB, and variants such as AWS
Aurora/Redshift or Google Cloud Platform SQL.

Learn more at...


- [GitHub](https://github.com/LaWebcapsule/directus9)

**All the following links are for Directus v10 ; contribution are welcome to make specific documentation for the Directus 9**

- [Website](https://directus.io/)
- [Documentation](https://docs.directus.io/)
- [Community](https://directus.chat/)
- [Twitter](https://twitter.com/directus)
- [Cloud](https://directus.cloud/) 
- [Marketplace](https://directus.market/)

<p>&nbsp;</p>

## Installing

Directus requires NodeJS 10+. 

Install Directus9 :

```
npm install @wbce-d9/directus9
```

Or using yarn:

```
yarn install @wbce-d9/directus9
```

Create a new project with our simple CLI tool:

```
npx directus init
```
The above command will create a directory with your project name, then walk you through the database configuration and
creation of your first admin user.

<p>&nbsp;</p>

## Updating

To update an existing Directus project, navigate to your project directory and run:

```
npm update
```

<p>&nbsp;</p>

## Migrating from directus@9.0.0^ to directus9@9.0.0^

You need to change your dependencies :
1. In package.json
```
"directus":9.0.0^ --> "directus9": 9.0.0^
"@directus/some-package" --> "@wbce-d9/some-package"
```

2. Update your dependencies :
```
npm update
```

3. If you have some code :

```ts
import {...} from "directus"
import {...} from "@directus/some-package"
```
should become :

```ts
import {...} from "@wbce-d9/directus9"
import {...} from "@wbce-d9/some-package"
```

4. You don't have to do any changes to your databases.
Directus9 use the same schema as directus@9.0.0^. As a consequence, you don't need other changes than the three step below.



## Contributing

Please report any and all issues [on our GitHub](https://github.com/LaWebcapsule/directus9/issues/new).

Pull-requests are more than welcome, and always appreciated. Please be sure to read our
[Contributors Guide](https://docs.directus.io/contributing/introduction/) before starting work on a new feature/fix, or
reach out a member of the Core Team via [GitHub](https://github.com/LaWebcapsule/directus9/discussions) or
[Discord](https://directus.chat) with any questions.

<p>&nbsp;</p>

## Supporting

This is a fork of directus9. We welcome contribution and no support is asked.

<p>&nbsp;</p>

## License

Directus is released under the [GPLv3 license](./license). Monospace Inc owns all Directus trademarks, logos, and intellectual property on behalf of our project's community. Copyright © 2004-2020, Monospace Inc.


**This repository is a fork of the Directus 9. Directus 9 was under BSL license and so is this repository. As Directus 10 is now <i>a premium open-source software</i>, this repository aims to maintain a standard openSource version of Directus 9. This repository is not bound to the directus core team.**
