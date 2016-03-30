## Technology

* UI is developed using [Angular JS](https://angularjs.org)
* ES6(ES2015) JavaScript is transpiled with [TypeScript](http://www.typescriptlang.org)
* UI is composed of a core module and service modules for different functional groups
* Modules are developed using directives, here is a good read on the topic: http://briantford.com/blog/angular-bower
* The backend of the application are written in Java Web Services, the ui services call the REST APIs
* Styling the application is done using [SASS](http://sass-lang.com/)
* Styling is based on Bootstrap CSS, a custom Cisco Bootstrap CSS is used for the portal: http://collab-lib.cisco.com/dist/#/overview
* Localization is done using angular translation
* Unit testing is written using Jasmine with Karma
* End to end testing is based on the JS Selenium framework: Protractor
* Build process is built and run with Gulp.js

## TypeScript & ES6(ES2015)

* ES6 and TypeScript are the preferred method of writing JavaScript in the app
* Writing Angular 1.x code in TypeScript and/or ES6 will allow for easier migration to Angular 2