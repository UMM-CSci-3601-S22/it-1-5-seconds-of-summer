# Development Instructions <!-- omit in toc -->

This is a guide to setting up the development environment for this project as well as running and testing it.

- [Setup](#setup)
  - [Make sure you have Mongo running on your computer](#make-sure-you-have-mongo-running-on-your-computer)
  - [Open the project in VS Code](#open-the-project-in-vs-code)
  - [Installing the client dependencies](#installing-the-client-dependencies)
  - [Enable ESLint in VS Code](#enable-eslint-in-vs-code)
  - [Seeding the Database](#seeding-the-database)
- [Running the project](#running-the-project)
  - [MongoDB in VS Code](#mongodb-in-vs-code)
- [Testing and Continuous Integration](#testing-and-continuous-integration)
  - [Testing the client](#testing-the-client)
    - [Linting the client](#linting-the-client)
  - [Testing the server](#testing-the-server)
  - [End to end testing](#end-to-end-testing)
  - [GitHub Actions](#github-actions)

## Setup

You can clone your repository using the command line or GitKraken:

1. From the file menu, choose **Clone Repo**
2. Choose GitHub.com in the middle column (as the source location of your repo)
3. Browse to the location you'd like to put the local copy of this project repo
4. Select the correct repo from the list of repositories
5. Select **Clone the repo!**

### Make sure you have Mongo running on your computer

For all of this to work, it's critical that you have Mongo installed
and working, as described in the system setup documentation from the
beginning of the semester. If you're unsure if it's set up and
working correctly, try running `mongo`.

If your MongoDB server isn't running you'll likely get an error
message like:

```text
Error: couldn't connect to server 127.0.0.1:27017, connection attempt failed: SocketException: Error connecting to 127.0.0.1:27017 :: caused by :: Connection refused :
```

(Type `exit` to exit out of the `mongo` tool.)

### Open the project in VS Code

Launch Visual Studio Code, and then choose `File -> Open Folder…`. Navigate to your clone
of the repo and choose `Open`.

You may see a dialog that looks like this if you don't already have the recommended extensions:

![Dialog suggesting installation of recommended extensions](https://user-images.githubusercontent.com/1300395/72710961-bf767500-3b2d-11ea-8ea4-fbbd39c78da5.png)

Don't worry if you don't get the dialog, it is probably because you already have them all installed.

Like in previous labs, click "Install All" to automatically install them.

### Installing the client dependencies

Before you start working you will need to install the dependencies for the client.

1. Move into the `client` directory (`cd client`)
2. Run `npm install`

### Enable ESLint in VS Code

ESLint is a tool for checking the quality and style of your client TypeScript
and template HTML code, and can provide valuable "live" feedback on
your coding in VS Code.

Since this is the first time we will be using ESLint there is an additional step to make sure the VS Code extension is working in the project. When you first open a TypeScript file you will see at the bottom right that ESLint is disabled.

![image](https://user-images.githubusercontent.com/1300395/107999308-bc59ec80-6fac-11eb-9784-75a471a50aa4.png)

Click the red "ESLINT" to open this dialog:

![image](https://user-images.githubusercontent.com/1300395/107996971-528b1400-6fa7-11eb-89bc-afc71747f820.png)

Click "Allow Everywhere" to enable ESLint.

You can also open this dialog with the following steps:

1. Hit `CTRL + SHIFT + P` (`⌘ + ⇧ + P` on Macs) to open the Command Palette. You can also find this by going to the "View" menu and clicking "Command Palette..."
2. Start typing and select "ESlint: Manage Library Execution". That should open a dialog seen above.

### Seeding the Database

To give yourself some data to work with instead of starting with an empty database in our development environment, you need to 'seed' the database with some starter data. Seed data and the seed script are stored in the top level directory `database`. To seed the database, move into that directory and run `./mongoseed.sh` (or `.\mongoseed.bat` on Windows). This will take each of the JSON files in `database/seed/` and insert their elements into the `dev` database.

These scripts also drop the database before seeding it so it is clean. You should run this after first cloning the project and again anytime you want to reset the database or you add new seed data to the `database/seed/` directory.

:warning: Our example E2E tests also reseed the `dev` database
whenever you run them to ensure that those tests happen in a predictable
state, so be prepared for that.

You'll want to create your own seed files and add them to the
`database/seed/` directory for new types used by your project. There
are nice tools like
[next.json-generator.com](https://next.json-generator.com/) that you
can use to easily generate sophisticated seed data for your project.

## Running the project

- The **run** Gradle task (`./gradlew run` in the `server` directory) will still run your Javalin server, which is available at [`localhost:4567`](http://localhost:4567).
- The **build** task will still _build_ the server, but not run it.

Once you have successfully run `npm install`, in order to serve up the _client side_ of your project, you will run
`ng serve` (from the `client` directory as well). The client will be available by default at [`localhost:4200`](http://localhost:4200). If your server is running, you will be able to see data for users if you navigate to the right place in the project.

To recap, **here are the steps needed to _run_ the project**:

1. Go into the `server` directory and enter `./gradlew run`.
2. In a _different_ terminal, go into the `client` directory and enter `ng server`.
3. You can then go to [`localhost:4200`](http://localhost:4200) in your favorite web browser and see
   your nifty Angular app.

### MongoDB in VS Code

We have included the [MongoDB for VS Code](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode) in the recommended extensions. This extension allows you to view and edit things in the Mongo database.

<details>
<summary>Expand for setup instructions</summary>

When installed you will see a new icon in the sidebar, click it and click "Add Connection".

![Screenshot of the Mongo Extension pane](https://user-images.githubusercontent.com/1300395/109005040-1f174c00-766f-11eb-85fb-0de47b22e4ae.png)

That will open a new tab with some options. Click "Open form" under "Advanced Connection Settings"

![image](https://user-images.githubusercontent.com/1300395/109006193-6c47ed80-7670-11eb-8b28-a740f9088d4f.png)

You can leave all the default settings and click the green "Connect" button to add the connection.

![image](https://user-images.githubusercontent.com/1300395/109006728-fabc6f00-7670-11eb-9f15-55a39f7b9674.png)


You will then have the MongoDB server in the sidebar.

</details>

You can explore the databases and collections here. You can click a record to view and edit it.

![Screenshot of displaying the users in the sample MongoDB database in VS Code](https://user-images.githubusercontent.com/1300395/109005447-91882c00-766f-11eb-994e-9a326deee21b.png)

## Testing and Continuous Integration

There are now more testing options! You can test the client, or the server or both.

### Testing the client

From the `client` directory, `ng test` runs the client tests.

- This will pop up a Chrome window with the results of the tests.
- This will run "forever", updating both in your terminal and in the Chrome
 window that gets generated. Typing CTRL-C in the terminal window will end
 the `ng test` process and close the generated Chrome window.
- You can add `ng test --watch=false` if you just want to run the tests once
 instead of going into the "run forever" mode.
- It outputs the test coverage percentages and will fail if any are lower than 80%.
- It generates a coverage report you can find in your client directory `client/coverage/client/index.html`.
  - Right click on `index.html` and select `Copy path` and paste it into your browser of choice. You can also drag and drop `index.html` onto the tab area of your browser and it will open it.

#### Linting the client

We have included a tool called ESLint which helps analyze the client
TypeScript and template HTML code and catch various errors and concerns. You will most likely see it directly in VS Code as yellow and red underlines. You can also directly run the linter on the entire client by running `ng lint` in the terminal in the `client` directory. This will check the whole client project and tell you if there are any issues.

### Testing the server

From the `server` directory, `./gradlew test` runs the server tests once.

- It generates a report you can find in `server/build/reports/tests/test/index.html`.
- It generates a coverage report you can find in `server/build/jacocoHtml/index.html` in addition to the regular report generated by the `test` task.
- It will fail if any of the the test coverage metrics is under 80%.

### End to end testing

End to end (E2E) testing involves the whole software stack rather than one part of it. Our E2E tests look at the behavior of both the client,
the server, and the database, and how they interact by simulating how a real user would interact with the app.

We use [Cypress](https://www.cypress.io/) for our end-to-end tests. There are a few ways to run the E2E tests. They are all started from the `client` directory and require the server be running at the same time (`./gradlew run` in the `server` directory).

- `ng e2e` both builds and serves the client and runs through all the Cypress end-to-end tests once.
- `ng e2e --watch` builds and serves the client but just opens Cypress for you to be able to run the tests you want without closing automatically.
  - This is the same as running `ng serve` and `npm run cy:open` (or `npx cypress open`) at the same time. If you are already running `ng serve` it will be easier to do this rather than closing it and running `ng e2e`.

The main page of Cypress looks like this:

![image](https://user-images.githubusercontent.com/1300395/109009410-22f99d00-7674-11eb-9469-dd6a09710813.png)

You can click on any of the integration test files to run their tests or run them all. When you run a set of tests you will see something like this:

![image](https://user-images.githubusercontent.com/1300395/109009528-3f95d500-7674-11eb-86ee-8c5e375d5d0b.png)

There are a lot of neat things you can do here like inspect each test and find which selectors to use in the tests you are writing. We encourage you to look through some of the Cypress documentation linked in the "Resources" section below.

### GitHub Actions

There are three GitHub Actions workflows set up in the repo:

- [Server Java](../../actions/workflows/server.yml) - JUnit tests for the server (`gradle-build`)
- [Client Angular](../../actions/workflows/client.yaml) - Karma tests (`ng-test`) and ESLint linting (`ng-lint`) for the client
- [End to End](../../actions/workflows/e2e.yaml) - Cypress tests for end-to-end testing

There are badges above that show the status of these checks on the main branch.
