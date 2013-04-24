# CrowdProcess Command Line Interface

# Install

```bash
npm install -g crowdprocess-cli
```

# Use

## job

Create a job and upload some data

```bash
$ crowdprocess-cli job -d tests/fixtures/data.json -c 123 -p tests/fixtures/program.js -b 12
About to create job with these options:
{ bid: 12,
  client_id: 123,
  dataFilePath: 'tests/fixtures/data.json',
  program: 'function Run(d) {\n  return d * 2;\n}' }
Confirm? [y,n] (y)
Job successfully created with id QszRDfLHkjKHbyIZyFQD7GEM4yL
Upload terminated
```

## progress

Check the progress of a given job

```bash
$ crowdprocess-cli progress QszRDfLHkjKHbyIZyFQD7GEM4yL
Progress for job QszRDfLHkjKHbyIZyFQD7GEM4yL:
  0%
  Total   : 1000
  Complete: 0
  Pending : 1000```