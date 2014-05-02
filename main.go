package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/docopt/docopt.go"
)

var ADDRESS = getAddress() // "https://api.crowdprocess.com"

const VERSION = "0.8.1"

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

func getAddress() string {
	crpAddress := os.Getenv("CRP_ADDRESS")
	if crpAddress != "" {
		return crpAddress
	}
	return "https://api.crowdprocess.com"
}

func main() {
	var err error

	args, err := docopt.Parse(USAGE, nil, true, "crowdprocess "+VERSION, true)
	if err != nil {
		fmt.Printf("Error: %s\n", err.Error())
		os.Exit(-1)
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
		err = authCmd(argv)
	case "create":
		err = createCmd(argv)
	case "delete":
		err = deleteCmd(argv)
	case "errors":
		err = errorsCmd(argv)
	case "list":
		err = listCmd(argv)
	case "results":
		err = resultsCmd(argv)
	case "show":
		err = showCmd(argv)
	case "upload":
		err = uploadCmd(argv)
	case "":
		fmt.Print(USAGE)
	default:
		fmt.Printf("crowdprocess: '%s' is not a crowdprocess command. See 'crowdprocess --help'.\n", cmd)
	}

	if err != nil {
		fmt.Printf("Error: %s\n", err.Error())
		os.Exit(-1)
	}
}
