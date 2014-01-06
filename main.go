package main

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/docopt/docopt.go"
)

const ADDRESS = "https://api.crowdprocess.com"

const VERSION = "0.8.0"

var USERNAME string
var PASSWORD string

var client = &http.Client{}

const USAGE = `Usage: crowdprocess [options] [<command>] [<args>...]

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
`

func main() {
	var err error

	args, err := docopt.Parse(USAGE, nil, true, "crowdprocess "+VERSION, true)
	if err != nil {
		panic(err.Error())
	}

	cmd, _ := args["<command>"].(string)
	cmdArgs := args["<args>"].([]string)

	userpass, ok := args["--user"].(string)
	if ok {
		split := strings.SplitN(userpass, ":", 2)
		USERNAME = split[0]
		if len(split) > 1 {
			PASSWORD = split[1]
		}
	}

	argv := make([]string, 1)
	argv[0] = cmd
	argv = append(argv, cmdArgs...)

	switch cmd {
	case "auth":
		authCmd(argv)
	case "create":
		createCmd(argv)
	case "delete":
		deleteCmd(argv)
	case "errors":
		errorsCmd(argv)
	case "list":
		listCmd(argv)
	case "results":
		resultsCmd(argv)
	case "show":
		showCmd(argv)
	case "upload":
		uploadCmd(argv)
	case "":
		fmt.Print(USAGE)
	default:
		fmt.Printf("crowdprocess: '%s' is not a crowdprocess command. See 'crowdprocess --help'.\n", cmd)
	}
}
