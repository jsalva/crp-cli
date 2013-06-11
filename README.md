# CrowdProcess Command Line Interface

# Install

```bash
npm install -g crowdprocess-cli
```

# Use

## signup

CrowdProcess is currently in a private beta, so you'll need an invite to use it.

To get an invite all you have to do is ask [@CrowdProcess](http://twitter.com/CrowdProcess) (or [email](mailto:helloooooooooooooooooooooooooooooooo@crowdprocess.com)).

```bash
$ crowdprocess signup -i <invite>
Password:
Logged in
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
$ crowdprocess faults QszRDfLHkjKHbyIZyFQD7GEM4yL -O results.json
...
```