# sloc-shields

![Lines of Code shield](https://5ezz6jithh.execute-api.us-east-1.amazonaws.com/prod/lambda-shield-redirect?user=raptortech-js&repo=sloc-shields)

### WIP

This project works, is. There's no documentation or testing, but you can see from the shield above that it works, roughly.

### Purpose

This project aims to serve three goals:

- A shield API that allows you to add a shield (aka badge) to your github project to display the number of lines of code
- A proof of concept for an easy way to build custom shield APIs that generate a shield on-demand based on the state of the
project
- The tools necessary to make #2 easy

### Design

The image link goes to an API Gateway API that passes the request to Lambda, which downloads the current state of the
 project from Github and runs [SLOC](https://github.com/flosse/sloc) on the resulting directory. It takes the results and
forms them into a URL suitable for http://shields.io that looks something like
 `https://img.shields.io/badge/<SUBJECT>-<STATUS>-<COLOR>.svg`. API Gateway then takes this result and returns an HTTP 302
redirect to the user, with a Location field set to the generated shields.io URL. Thus, shields.io serves the intended image
to the user.

### How to use

`![Lines of Code shield]
(https://5ezz6jithh.execute-api.us-east-1.amazonaws.com/prod/lambda-shield-redirect?
user=[YOUR-GITHUB-USERNAME]&repo=[YOUR-GITHUB-REPO-NAME])`

### Is this useful?

It's really questionable why you would want to have the number of lines of code in your project right on your Github
 README. What is the end user supposed to take away? Why do they care? If you can satisfactorily answer that, then sure,
 use it; for most projects, though, this number is irrelevant.

### So why have I created this project?

To show that with just a few lines of code, you can can make your own shield API that calculates custom properties and uses
them to generate custom shields.
