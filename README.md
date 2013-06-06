# CrowdProcess Command Line Interface

# Install

```bash
npm install -g crp-cli
```

# Use

## signup

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
$ crowdprocess task -d tests/fixtures/data.json -p tests/fixtures/program.js
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
$ crowdprocess progress QszRDfLHkjKHbyIZyFQD7GEM4yL
Progress for task QszRDfLHkjKHbyIZyFQD7GEM4yL:
  100%
  Total   : 1000
  Complete: 1000
  Pending : 0
```

## download

Download results of a given task.

Output format is JSON.

```bash
$ crowdprocess download QszRDfLHkjKHbyIZyFQD7GEM4yL -O results.json
```