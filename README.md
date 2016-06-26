# sloc-shields

### WIP

This project is completely a work in progress. Nothing really works right now and there's no documentation or testing

### Purpose

This project aims to serve three goals:

- A shield API that allows you to add a shield (aka badge) to your github project to display the number of lines of code
- A proof of concept for an easy way to build custom shield APIs that generate a shield on-demand based on the state of the
project
- The tools necessary to make #2 easy

### Design

The image link goes to an API Gateway API that passes the request to Lambda, which downloads the current state of the project
from Github and runs [SLOC](https://github.com/flosse/sloc) on the resulting directory. It takes the results and forms them
into a URL suitable for http://shields.io that looks something like
`https://img.shields.io/badge/<SUBJECT>-<STATUS>-<COLOR>.svg`. API Gateway then takes this result and returns an HTTP 302
redirect to the user, with a Location field set to the generated shields.io URL. Thus, shields.io serves the intended image to
the user.
