# MARTIN-server

## Introduction
This repository holds the code and documentation for the server-side material developed as part **947G5 Advanced Software Engineering** Task 4.

The AWS [Lambda Management Console](https://eu-west-2.console.aws.amazon.com/lambda/home?region=eu-west-2#/functions/HandleLocationUpdate?tab=configuration) hosts the **JavaScript** code that powers the server-side of the project.

Entries are made in the `locations` [DynamoDB table](https://eu-west-2.console.aws.amazon.com/dynamodb/home?region=eu-west-2#tables:selected=locations).

###### Why AWS?

Amazon Web Services was chosen as the platform to host the server-side of our project because it is very reputable, has very good documentation, and has a suitable 'free' tier.

More specifically, we chose to develop using **AWS Lambda** over, say Elastic Beanstalk, as it provided a conceptually elegant way of dealing with requests. Instances of our Node.js application are spawned to handle each request.

Each instance happens in an ad-hoc manner and can operate in a self-contained way, making it extremely scalable (and therefore able to deal with multiple requests at the same time).

###### Why `Node.js`?

The Lambda Management Console offered a lot of flexibility in terms of which programming language we would like to use. We chose `Node.js` as a number of us are familiar with JavaScript and those who are not felt they could learn it quickly.

###### Why DynamoDB?

---

###### To Do:

* Configure GitHub to push code changes automatically to AWS Lambda Management Console. Then document about the **build automation**.

Documentation for the following:

* Why did we choose a NoSQL approach over a traditional relational approach?

* Why did we choose writing to a database as opposed to writing individual files on a server?

* Why did we choose DynamoDB?

* How did we test this?
