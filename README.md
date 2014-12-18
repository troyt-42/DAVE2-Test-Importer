#Dave2 UI Prototype
  This project is designated to validate the technology stacks for DAVE2 front-end team at GFSA.
## Installation

* Requirement: 
  * Nodejs and npm installed
  * Have the Dave2_UI folder
  
* Steps:
  * Install bower globally using npm:
  <br><br>
  ```
  npm install bower -g
  ```
  * Change current directory to Dave2_UI folder in terminal
  * Use bower to install dependencies for Angularjs:
  <br><br>
  ```
  bower install
  ```
  * Change current directory to serverSideNodejs
  * Use npm to install dependencies for Nodejs:
  <br><br>
  ```
  npm install
  ```
  * Start the server:
  <br><br>
  ```
  node server.js
  Express server is listenning at 3000
  ```
* Note: 
after start the server, user may need change the url used in the js files because of the change of machine's IP address (e.g. from `http://10.3.86.65:3000` to `http://10.3.83.237:3000`).
  - Places need change:
    - **'/app.js'** at line **4** & **19**
    - **'/app_data_item_display/app_data_item_display.js'** at line **261**
    - **'/app_history_tracer/app_history_tracer.js'** at line **49** & **60**
    - **'/app_importer/app_importer.js'** at line **19, 29, 37** & **962**
  

##Dependencies
1. Web:
  - [AngularJS](https://angularjs.org/) (with ngRoute and ngAnimate) 
  - [jQuery] (http://jquery.com/)
  - [Socket.io] (http://socket.io/)
  - [Bootstrap 3] (http://getbootstrap.com/)
  - [Highcharts] (http://www.highcharts.com/)
  - [angular-file-upload] (https://github.com/nervgh/angular-file-upload)
  - [angular-snap] (http://jtrussell.github.io/angular-snap.js/)
  - [angular-ui-sortable] (https://github.com/angular-ui/ui-sortable)
  - [angular-bootstrap] (https://github.com/angular-ui/bootstrap)
  - [angular-dragdrop] (https://github.com/codef0rmer/angular-dragdrop)

2. Server
  - [body-parser] (https://github.com/expressjs/body-parser)
  - [Express 4] (http://expressjs.com/)
  - [kafka-node] (https://github.com/SOHU-Co/kafka-node)
  - [multiparty] (https://github.com/andrewrk/node-multiparty)
  - [q] (https://github.com/kriskowal/q)
  - [Socket.io] (http://socket.io/)
  - [node-zookeeper] (https://github.com/yfinkelstein/node-zookeeper)

##To Do
1. Accomplish test.js using mocha(for nodejs) or karma(for angularjs).
2. Improve the kafka test app.
3. Create a highcharts libirary (or find aother way to handle highcharts)
4. ...
