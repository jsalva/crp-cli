package main

import (
	"fmt"
	"os"
	"sync"

	"github.com/docopt/docopt.go"
)

func authCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess auth login [<email>] [<password>]
       crowdprocess auth logout
`
	authArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	var username string
	username, _ = authArgs["<email>"].(string)
	var password string
	password, _ = authArgs["<password>"].(string)

	if authArgs["login"].(bool) {
		err = login(username, password)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		fmt.Println("Logged in")
		return
	}

	if authArgs["logout"].(bool) {
		err = logout()
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		fmt.Println("Logged out")
		return
	}
}

func createCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess create [--bid=<value>] [--group=<name>] <program> [<tasks> [<results>]]`

	args, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	var bid string
	var group string
	bid, _ = args["--bid"].(string)
	group, _ = args["--group"].(string)

	jobId, err := createJob(args["<program>"].(string), bid, group)
	if err != nil {
		panic(err.Error())
	}

	if !isTerminal(os.Stdin) {
		// shift optional arguments
		args["<results>"] = args["<tasks>"]

		args["<tasks>"] = "-"
	}

	tasks, ok := args["<tasks>"].(string)
	if !ok {
		// no further action required
		fmt.Printf("Created job with id: %s\n", jobId)
		return
	}

	if !isTerminal(os.Stdout) {
		args["<results>"] = "-"
	}

	wg := new(sync.WaitGroup)
	results, ok := args["<results>"].(string)
	if ok {
		go func() {
			wg.Add(1)
			defer wg.Done()
			streamTaskResults(jobId, results)
		}()
	}

	err = submitTasks(jobId, tasks)
	if err != nil {
		panic(err.Error())
	}

	wg.Wait()
}

func deleteCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess delete <job>`

	deleteArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	err = deleteJob(deleteArgs["<job>"].(string))
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("Job deleted")
}

func errorsCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess errors <job> [<path>]`

	errorsArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	path, _ := errorsArgs["<path>"].(string)

	err = getErrors(errorsArgs["<job>"].(string), path)
	if err != nil {
		fmt.Println(err.Error())
	}
}

func listCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess list`

	_, err = docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	jobs, err := listJobs()
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("Id                                     Created                            Tasks       Status")
	for _, job := range jobs {
		fmt.Printf("%-36s   %-33s   %8d   %-6s\n", job.Id, job.Created.Local(), job.Total, job.Status)
	}
}

func resultsCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess results <job> [<path>]`

	resultsArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	path, _ := resultsArgs["<path>"].(string)
	num := 0
	channel := make(chan int)

	showStatus := path != "" && path != "-"

	if showStatus {
		go func() {
			for {
				num = <-channel
				fmt.Printf("Number of results: %d\r", num)
			}
		}()
	}

	num, err = getResults(resultsArgs["<job>"].(string), path, channel)
	if err != nil {
		fmt.Println(err.Error())
	}

	if showStatus {
		fmt.Printf("Number of results: %d\n", num)
	}
}

func showCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess show <job>`

	showArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	job, err := showJob(showArgs["<job>"].(string))
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println("Id:", job.Id)
	fmt.Println("Created:", job.Created.Local())
	fmt.Println("Status:", job.Status)
	fmt.Println("Bid:", job.Bid)
	fmt.Println("Group:", job.Group)
	fmt.Println("Browser hours:", job.BrowserHours/1000/60/60)
	fmt.Println("Pending:", job.Total-job.Finished-job.Failed)
	fmt.Println("Failed:", job.Failed)
	fmt.Println("Finished:", job.Finished)
	fmt.Println("Total:", job.Total)
}

func uploadCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess upload <job> <tasks>`

	uploadArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	submitTasks(uploadArgs["<job>"].(string), uploadArgs["<tasks>"].(string))
}
