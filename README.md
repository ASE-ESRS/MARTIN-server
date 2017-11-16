# MARTIN-server

**M**assive **A**nd **R**ealistic **T**ime **I**nformed **N**eighbourhoods

[![Build Status](https://travis-ci.org/ASE-ESRS/MARTIN-server.svg?branch=master)](https://travis-ci.org/ASE-ESRS/MARTIN-server)
[![Coverage Status](https://coveralls.io/repos/github/ASE-ESRS/MARTIN-server/badge.svg?branch=master)](https://coveralls.io/github/ASE-ESRS/MARTIN-server?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/33627ab4a3c161412034/maintainability)](https://codeclimate.com/github/ASE-ESRS/MARTIN-server/maintainability)

## Introduction
This repository holds the code and documentation for the server-side material developed as part **947G5 Advanced Software Engineering** Task 4.

The AWS [Lambda Management Console](https://eu-west-2.console.aws.amazon.com/lambda/home?region=eu-west-2#/functions/HandleLocationUpdate?tab=configuration) hosts the **JavaScript** code that powers the server-side of the project.

Entries are made in the `locations` [DynamoDB table](https://eu-west-2.console.aws.amazon.com/dynamodb/home?region=eu-west-2#tables:selected=locations).

#### Why AWS?

Amazon Web Services was chosen as the platform to host the server-side of our project because it is very reputable, has very good documentation, and has a suitable 'free' tier.

More specifically, we chose to develop using **AWS Lambda** over, say Elastic Beanstalk, as it provided a conceptually elegant way of dealing with requests. Instances of our Node.js application are spawned to handle each request.

Each instance happens in an ad-hoc manner and can operate in a self-contained way, making it extremely scalable (and therefore able to deal with multiple requests at the same time).

#### Why `Node.js`?

The Lambda Management Console offered a lot of flexibility in terms of which programming language we would like to use. We chose `Node.js` as a number of us are familiar with JavaScript and those who are not felt they could learn it quickly.

#### Why DynamoDB?

AWS offer DynamoDB as a scalable, fast, and flexible NoSQL database service, which was perfect for our app. DynamoDB is lightweight and simple to use.

If we do continue to use it, then we should document why we chose this NoSQL approach over a traditional relational approach.

Also, why did we decide to write to a database rather than, say, text files on the server.

#### Build Automation

This project uses [Travis CI](https://travis-ci.org) as a continuous integration solution that performs all unit tests on the JavaScript code base and then automatically deploys `index.js` and its dependencies (in `node_modules`) to Amazon Web Servers. This enables the team to focus time on writing, testing and reviewing good code instead of ensuring that AWS has the latest version of the source code.

#### Testing

###### Unit Testing

As mentioned above, Travis CI automatically performs all unit tests on `index.js` when a commit is made to the master branch of the repo or when a pull request is opened. All unit tests are listed in `test.js`. As unit testing is not a core JavaScript concept, we use the [Mocha](https://mochajs.org/) framework to write unit tests. If any of the unit tests fail, the Travis CI build will fail, alerting the team that an issue needs to be fixed (and that the Pull Request that did not build should not be merged.)

###### User Testing

Perhaps the most common form of testing we carried out was user testing where the team working on the client-side made requests to the server-side to test the functionality. Specifically, boundary cases were tested to ensure the server-side could deal with them appropriately (reporting an error back to the user), rather than corrupting the database.
