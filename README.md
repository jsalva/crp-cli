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
