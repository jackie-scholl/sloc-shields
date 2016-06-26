# sloc-shields

![Lines of Code shield](https://5ezz6jithh.execute-api.us-east-1.amazonaws.com/prod/lambda-shield-redirect?user=raptortech-js&repo=sloc-shields)

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

#### Building the correct version of github

- Create an EC2 instance from an official Amazon Linux AMI
- SSH in
- `sudo yum install -y curl-devel expat-devel gettext-devel openssl-devel perl-devel zlib-devel autoconf && curl https://codeload.github.com/git/git/tar.gz/v2.9.0 > git-2.9.0.tar.gz && tar -zxf git-2.9.0.tar.gz && cd git-2.9.0 && make configure && ./configure --prefix=/var/task/compiled_binaries && make all`
