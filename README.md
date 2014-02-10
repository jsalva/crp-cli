# CrowdProcess Command Line Interface

[![CrowdProcess](https://crowdprocess.com/img/crowdprocess-logo-symbol.svg)](https://crowdprocess.com/)

[CrowdProcess](https://crowdprocess.com/) is a browser-powered distributed computing platform.  
The platform connects with our partner websites and they supply it with their viewers' browsers' processing power using an [HTML5 Web Worker](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers).  


# Usage
```bash
Usage: crowdprocess [options] [<command>] [<args>...]

Options:
  -h, --help                   Display this help and exit
  -v, --version                Output version information and exit
  -u, --user <email:password>  Authenticate the command using email and password

Commands:
  auth       Authenticate (login, logout)
  create     Create a job
  delete     Delete a job
  errors     Get job errors
  list       List jobs
  results    Get job results
  show       Show job information
  upload     Submit tasks for a job
```

# Getting started

## Install
Download the crowdprocess CLI from https://github.com/CrowdProcess/crp-cli/releases/latest into a $PATH directory.

### Linux
```bash
$ sudo wget https://github.com/CrowdProcess/crp-cli/releases/download/0.8.1/crowdprocess-linux-386 -O /usr/local/bin/crowdprocess && sudo chmod +x /usr/local/bin/crowdprocess
```

### OSX
```
$ sudo curl -L https://github.com/CrowdProcess/crp-cli/releases/download/0.8.1/crowdprocess-darwin-amd64 -o /usr/local/bin/crowdprocess && sudo chmod +x /usr/local/bin/crowdprocess
```

### No root ?

```
mkdir -p ~/bin
wget https://github.com/CrowdProcess/crp-cli/releases/download/0.8.1/crowdprocess-linux-386 -O ~/bin/crowdprocess
echo "alias crowdprocess=~/bin/crowdprocess"
```


## Login
Login with your CrowdProcess account. If you don't have an account, you can quicky create a free one in the [CrowdProcess website](https://crowdprocess.com/register).
```bash
$ crowdprocess auth login
Email: email@example.com
Password:
```

## Create job
In order to create a job, we need a program and a set of tasks.  
The program should be a single javascript file with a `Run` function as the entry point.  
The tasks file is composed by one or more json documents.  
For illustration purposes let's create a very simple program that returns it's only argument:

program.js
```js
function Run(d) {
  return d;
}
```

And a tasks file with six json documents:

tasks
```json
1
true
null
"a"
[1, 2, 3]
{ "data": [1, 2, 3] }
```

We can then create the job and get back the results.
```bash
$ crowdprocess create program.js tasks results
Job id: 76c9894b-3f09-4a20-ad5e-90946d2916ca
Tasks: 6    Results: 6    Errors: 0
```

Or using shell pipes:
```bash
$ cat tasks | ./crowdprocess create program.js - > results
Job id: 76c9894b-3f09-4a20-ad5e-90946d2916ca
Tasks: 6    Results: 6    Errors: 0
```

The results file should have something like this:
```bash
$ cat results
{ "data": [1, 2, 3] }
1
"a"
null
[1, 2, 3]
true
```

The results may come in any order, because they are streamed by the platform as soon as they arrive. Faster browsers will return quicker, hence no ordering is assured.

## List your jobs
```bash
$ crowdprocess list
Id                                     Created                            Tasks       Status
76c9894b-3f09-4a20-ad5e-90946d2916ca   2014-01-08 11:37:43.673 +0000 WET          6   active
53a17195-dc00-4f65-bfbc-41f5e6ca356a   2014-01-07 18:28:48.729 +0000 WET    1000000   active
```

## Download the results of a job
```bash
$ crowdprocess results 76c9894b-3f09-4a20-ad5e-90946d2916ca
{ "data": [1, 2, 3] }
1
"a"
null
[1, 2, 3]
true
```

# Example
```bash
$ crowdprocess auth login
Email: email@example.com
Password:
$ crowdprocess create program.js tasks.json results.json
Job id: 76c9894b-3f09-4a20-ad5e-90946d2916ca
Tasks: 3    Results: 3    Errors: 0
$ crowdprocess list
Id                                     Created                            Tasks       Status
76c9894b-3f09-4a20-ad5e-90946d2916ca   2014-01-08 11:37:43.673 +0000 WET          3   active
53a17195-dc00-4f65-bfbc-41f5e6ca356a   2014-01-07 18:28:48.729 +0000 WET    1000000   active
$ crowdprocess results 76c9894b-3f09-4a20-ad5e-90946d2916ca
6
2
4
```

```bash
$ cat program.js
function Run(d) {
  return d * 2;
}
$ cat tasks.json
1
2
3
```
