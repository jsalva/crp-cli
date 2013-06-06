# CrowdProcess Command Line Interface

# Install

```bash
npm install -g crp-cli
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

Create a task and upload some data

```bash
$ crowdprocess task -d tests/fixtures/data.json -c 123 -p tests/fixtures/program.js -b 12
About to create task with these options:
{ bid: 12,
  client_id: 123,
  dataFilePath: 'tests/fixtures/data.json',
  program: 'function Run(d) {\n  return d * 2;\n}' }
Confirm? [y,n] (y)
Task successfully created with id QszRDfLHkjKHbyIZyFQD7GEM4yL
Upload terminated
```

## list


```bash
$ crowdprocess list
created at          total       complete        pending      ID
04:44 13-05-31      1000        665             335          QszRDfLHkjKHbyIZyFQD7GEM4yL
```

## progress

Check the progress of a given task

```bash
$ crowdprocess progress QszRDfLHkjKHbyIZyFQD7GEM4yL --client 123
Progress for task QszRDfLHkjKHbyIZyFQD7GEM4yL:
  0%
  Total   : 1000
  Complete: 0
  Pending : 1000
```

## download

Download results of a given task.

For now the only supported output format is JSON-stream.

```bash
$ crowdprocess download QszRDfLHkjKHbyIZyFQD7GEM4yL -O results.json
```
