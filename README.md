Wheat Farmer
===


Farming/Tower Defense web-based game. **[Live demo (desktop-only)](https://360-noscope.de/wheat-farmer)**

* 🌾 Entirely made from scratch ([Exceptions](https://github.com/alexanderroidl/wheat-farmer#5-third-party-contents))
* 🌾 Written in **TypeScript**
* 🌾 Linted with **ESLint**
* 🌾 Built using **Node**/**Gulp** (**Browserify** + **TSify** + **Babelify**)
* 🌾 Deployed with **Docker** multi-stage build
* 🌾 Rendering on HTMLCanvas
* 🌾 Soundtrack by collaborator [@julianarnold96](https://github.com/julianarnold96)

![](preview.gif)


# Table of contents
1. [The Game](#1-the-game)
2. [Dependencies](#2-dependencies)
3. [Without Docker](#3-without-docker)
    1. [Installation](#31-installation)
    2. [Usage](#32-usage)
4. [With Docker](#4-with-docker)
    1. [Installation](#41-installation)
    2. [Usage](#42-usage)
5. [Third-party contents](#5-third-party-contents)
6. [Collaborators](#6-collaborators)


# 1. The Game
**The game is currently at early alpha developing stage**, meaning it is neither complete, nor bug-free.

**Implemented mechanics:**
- Gather wheat by planting seeds and waiting for your crops to grow, harvesting them upon completion ✅ 
- Avoid hostile robot attacks while farming ✅
- Purchase and build up walls for defense ✅
- Manage your inventory ✅
- Purchase items in the shop ✅

**Road map:**
* Automate farming by upgrading technology ❌


# 2. Dependencies
* [Node.js/NPM](https://nodejs.org)
* [Docker](https://www.docker.com/) (optional)


# 3. Without Docker
**Please execute all commands directly inside the ```project``` sub-directory.**

## 3.1. Installation 
Install ```Yarn``` globally:
```bash
$ npm install --global yarn # Install Yarn globally
```

Install project dependencies:
```bash
$ cd project

$ yarn
```

## 3.2. Usage
* When the web server is running, it will become accessible on ```http://localhost:3000```.
* When in development mode, BrowserSync + webserver will become available on ```http://localhost:3000```.

```bash
$ cd project

$ yarn build # Build once
$ yarn develop # Build once and watch afterwards - (Re-)starts webserver and BrowserSync
$ yarn production # Build in production mode (Compress everything, strip debug)
$ yarn start # Start Express webserver to serve files
$ yarn lint # Run ESLint on TypeScript code
```


# 4. With Docker
# 4.1. Installation
Install ```Yarn``` globally:
```bash
$ npm install --global yarn # Install Yarn globally
```

Install project dependencies:
```bash
$ yarn # Install project dependencies
```

# 4.2. Usage

Run ```yarn docker:development``` or ```yarn docker:production``` to build/start based on your environment.

```bash
$ yarn docker:development # Build/start development environment
$ yarn docker:production # Build/start production environment
```

# 4.3. Development

* When in the development environment, ```./project``` will be synced with your running Docker container.
* BrowserSync will deploy itself on ```http://localhost:3000```.
* ```yarn develop```[*](#32-usage) will execute upon startup ➡ **all changes inside ```./project``` will lead to an immediate re-build and browser refresh.**

# 5. Third-party contents
* [GameLoop.js](https://gist.github.com/niklaskorz/2ef312693977e02d3fb4751b28f7d435) by [Niklas Korz](https://gist.github.com/niklaskorz)
* [OpenMoji font](https://openmoji.org/)
* ["212 Keyboard" font](https://www.dafont.com/212-keyboard.font) by [212 fonts](https://www.dafont.com/elizabeth.d7791)

# 6. Collaborators
* [@alexanderroidl](https://github.com/alexanderroidl) (maintainer)
* [@julianarnold96](https://github.com/julianarnold96)
