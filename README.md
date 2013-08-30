# CrowdProcess Command Line Interface

[![CrowdProcess](http://crowdprocess.com/CrowdProcessLogo.png)](http://crowdprocess.com/)

[CrowdProcess](http://crowdprocess.com/) is a browser-powered distributed computing platform.  
The platform connects with our partner websites and they supply it with their viewers' browsers' processing power using an [HTML5 Web Worker](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers).  

We make that processing power available to our users and clients through this Command Line Interface.  
With it you can have access to the platform, submit your tasks and play around a bit.

# Install  
First you will need to install [Node on your computer](http://nodejs.org/ "Just click 'install'").  
And then run...
```bash
npm install -g crowdprocess-cli
```  
# Use  
## signup
CrowdProcess is currently in a private beta, so you'll need an invite to use it.  
To get an invite all you have to do is ask [@CrowdProcess](http://twitter.com/CrowdProcess) on twitter or send us an [email](mailto:hello@crowdprocess.com?&subject="Gimme an invite code"&body="Hi,"&body="My name is"&body="I wanto to use CrowdProcess to").
```bash
$ crowdprocess signup -i <invite>
Email: email@example.com
Password:
Signed Up
```
## login
```bash
$ crowdprocess login
Email: email@example.com
Password:
Logged in
```
## task
Create a task, with a program.js and a data.json.
```bash
$ crowdprocess task -d data.json -p program.js
About to create task with these options:
{ bid: 12,
  client_id: 123,
  dataFilePath: 'tests/fixtures/data.json',
  program: 'function Run(d) {\n  return d * 2;\n}' }
Confirm? [y,n] (y)
Task successfully created with id QszRDfLHkjKHbyIZyFQD7GEM4yL
Upload terminated
```
Sample program.js:
```js
function Run(d) {
  return d + d;
}
```
Sample data.json
```json
[
  "1",
  "2",
  ...
  "999",
  "1000"
]
```
## io
Pipe the JSON data into the `crowprocess` command and it spits out the results to the STDOUT:
```javascript
$ cat data.json | crowdprocess io -p program.js > results.json
```
## list
```bash
$ crowdprocess list
created at    state   total   errors    complete  pending   ID
07:01 13-06-11    complete    2   0   2   0   EFf6EHhiQG9BZWStX61VyHaR11s
06:59 13-06-11    complete    2   0   2   0   CfVxrNRklI9trHCnLm8JUo5PrGK
06:57 13-06-11    complete    2   0   2   0   4B7WkfSQFYNdeHVPxAiLhs2ecpr
06:50 13-06-11    complete    2   0   2   0   CCucVebIQhYZHxiDLXvq0rkVKRh
06:47 13-06-11    complete    10000   1   10000   0   4GoVWuqanamtegaofKPlbYJ2r1F
```
## delete
Delete a task and all the associated data.
```bash
$ crowdprocess delete EFf6EHhiQG9BZWStX61VyHaR11s
```
## progress
Check the progress of a given task
```bash
$ crowdprocess progress QszRDfLHkjKHbyIZyFQD7GEM4yL
Progress for task QszRDfLHkjKHbyIZyFQD7GEM4yL:
  100%
  Total   : 1000
  Complete: 1000
  Pending : 0
  Errors  : 0
```
## download
Download results of a given task.
Output format is JSON.
```bash
$ crowdprocess download QszRDfLHkjKHbyIZyFQD7GEM4yL -O results.json
```
## faults
Get all faults that happened while processing a task
```bash
$ crowdprocess faults QszRDfLHkjKHbyIZyFQD7GEM4yL
...
```
We are still trying to figure out what is the best way of handling errors. It is hard to get a meaningful error message and a proper stacktrace for a CrowdProcess task.
Basically there are two types of errors: **programErrors** and **processingErrors**. The former means there was a error just trying to load your program, these can be syntax errors of even just trying to execute some initialization specified by the program, the latter means there was an error when processing a dataunit, i.e. when the Run gets called.
When there is an error, CrowdProcess tries again, until it reaches a limit of retries, and quits.
There seem to be some weird browsers on the web so having some errors sometimes is probably normal. Again, we are still trying to figure a better way to deal with this.

# FAQ

### How is the data distributed?

The data.json file should be an array. Entries of the array are streamed to browsers. Each entry of the array can end up in a distinct browser. No browser will download the whole json file.

### What if I need to use external network resources from the program?

Access to APIs like WebSockets and AJAX is disabled due to the risk of generating DDOS. In a near future CrowdProcess will likely provide an API that can provide access to external resources in a safely manner.

### Is there a more flexible way to send data?

It is possible to submit dataunits that are not written in a JSON file. This module streams the data.json file rather than buffering it and sending it all at once. Our task submission API supports streaming uploads. You can use the `io`ommand that works like this:

```
programThatStreamsJsonToStdout | crowdprocess io -p program.js > results
```

You can also look into [task-client](https://github.com/CrowdProcess/crp-task-client) if you want check out how the steaming is done.

### How to make an app run for infinite time?

If you create a task, and keep streaming dataunits in and results out it will never end.

### Is it possible to share state between browsers?

Each computation must run in isolation. However, dataunits can be submitted dynamically and can reflect the meaning of results received until then, this is currently the best way to propagate state.

### Is it possible to import scripts? Can I organize my code in more than one file?

The importScript function isn't available in CrowdProcess Tasks. This does not mean you should work with a single big file. There are several good ways to produce a single concatenated and perhaps minified javascript file from a set of properly organized javascript files.

Maybe take a look at our [Program Boilerplate](https://github.com/CrowdProcess/program-boilerplate/) it needs more work and especially better documentation but it contains a Gruntfile.js (kind of a javascript makefile) that produces a program.js from your code, which you can organize using [Node's require system](http://nodejs.org/api/modules.html).

### Is it safe for the browser user?

There are several levels of isolation that safeguard browser users from CrowdProcess users. These include but are not limited to, the iframe's sandboxing properties, the webworker's sandboxing properties, access removal to anything that might affect the browser user's navigation experience or privacy.
