# MARTIN-server

**M**assive **A**nd **R**ealistic **T**ime **I**nformed **N**eighbourhoods

[![Build Status](https://travis-ci.org/ASE-ESRS/MARTIN-server.svg?branch=master)](https://travis-ci.org/ASE-ESRS/MARTIN-server)
[![Coverage Status](https://coveralls.io/repos/github/ASE-ESRS/MARTIN-server/badge.svg?branch=master)](https://coveralls.io/github/ASE-ESRS/MARTIN-server?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/33627ab4a3c161412034/maintainability)](https://codeclimate.com/github/ASE-ESRS/MARTIN-server/maintainability)

## Introduction
This repository holds the code and documentation for the server-side material developed as part **947G5 Advanced Software Engineering** Task 4.

The AWS [Lambda Management Console](https://eu-west-2.console.aws.amazon.com/lambda/home?region=eu-west-2#/functions/HandleLocationUpdate?tab=configuration) hosts the **JavaScript** code that powers the server-side of the project.

The deprecated [codebase](https://github.com/ASE-ESRS/Group-Project) previously both the client-side _and_ server-side code. The repositories have been split into the two distinct projects (this, and the [MARTIN-client repo](https://github.com/ASE-ESRS/MARTIN-client)) as they are conceptually separate developments. Splitting the repositories also aided the use of Travis CI (discussed below).

Code is 'owned' jointly by the 'project'. [`git-blame`](https://git-scm.com/docs/git-blame) will be used to determine the author of code.

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

Functions (e.g. that verify latitude/longitude inputs) have been abstracted into their own 'self-containing', modular methods to reduce dependencies and simplify testing.

###### User Testing

Perhaps the most common form of testing we carried out was user testing where the team working on the client-side made requests to the server-side to test the functionality. Specifically, boundary cases were tested to ensure the server-side could deal with them appropriately (reporting an error back to the user), rather than corrupting the database.

## Preprocessing

The [input dataset](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads), a 4 GB CSV file, contains just over 22 million entries of the price paid for properties at various locations around the country. Much of the information in the input dataset is not required.

A Python script (`preprocessing/process_postcodes.py`) has been developed to extract the following (required) information from the input dataset:
- Postcode.
- Price paid.
- Date of purchase.

The client will be requesting 'nearby' datapoints, and so keeping these referenced by their postcodes would be suboptimal, if possible at all. Instead, the [postcodes.io](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) API was used to convert these postcodes (in batches of 100) to latitude/longitude coordinates.

Following this, the entries are pushed to the `store_location_price.js` Lambda function hosted on AWS to be stored in the `price_paid_data` DynamoDB table. Postcodes are still linked to entries as they are used as primsry keys.

If a duplicate entry for a postcode is discovered, the **most recent** entry is chosen. The elegance of this simple solution is that it allows the script to be re-run at a later date (with a newer dataset, for instance) and any newer entries for a given postcode will overwrite their older counterparts.
