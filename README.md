# CrowdProcess Command Line Interface

[![CrowdProcess](http://crowdprocess.com/img/crowdprocess-logo-symbol.svg)](http://crowdprocess.com/)

[CrowdProcess](http://crowdprocess.com/) is a browser-powered distributed computing platform.  
The platform connects with our partner websites and they supply it with their viewers' browsers' processing power using an [HTML5 Web Worker](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers).  

We make that processing power available to our users and clients through this Command Line Interface.  
With it you can have access to the platform, submit your tasks and play around a bit.

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
3
1
2
```

```bash
$ cat program.js
function Run(d) {
  return d;
}
$ cat tasks.json
1
2
3
```
