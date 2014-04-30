package main

import (
	"fmt"
	"os"
	"time"

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
		return
	}

	if authArgs["logout"].(bool) {
		err = logout()
		if err != nil {
			fmt.Println(err.Error())
			return
		}
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
		fmt.Println(err.Error())
		return
	}

	fmt.Fprintf(os.Stderr, "Job id: %s\n", jobId)

	if !isTerminal(os.Stdin) {
		// shift optional arguments
		args["<results>"] = args["<tasks>"]
		args["<tasks>"] = "-"
	}

	if !isTerminal(os.Stdout) {
		args["<results>"] = "-"
	}

	tasks, ok := args["<tasks>"].(string)
	if !ok {
		// no further action required
		return
	}

	numTasks := 0
	numResults := 0
	numErrors := 0
	tasksChannel := make(chan int, 1000000)
	resultsChannel := make(chan int, 1000000)
	errorsChannel := make(chan int, 1000)

	results, ok := args["<results>"].(string)
	if ok {
		go streamTaskResults(jobId, results, resultsChannel)
		go streamTaskErrors(jobId, "", errorsChannel)
	}

	showProgress := args["<results>"] != "" && args["<results>"] != "-" || !isTerminal(os.Stdout)
	go func() {
		for {
			select {
			case numTasks = <-tasksChannel:
			case numResults = <-resultsChannel:
			case numErrors = <-errorsChannel:
			}

			if showProgress {
				fmt.Fprintf(os.Stderr, "Tasks: %d   ", numTasks)
				if ok {
					fmt.Fprintf(os.Stderr, "Results: %d   ", numResults)
					fmt.Fprintf(os.Stderr, "Errors: %d   ", numErrors)
				}
				fmt.Fprintf(os.Stderr, "\r")
			}
		}
	}()

	numTasks, err = submitTasks(jobId, tasks, tasksChannel)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	for {
		if !ok || numTasks <= numResults+numErrors {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}

	if showProgress {
		fmt.Fprintf(os.Stderr, "Tasks: %d   ", numTasks)
		if ok {
			fmt.Fprintf(os.Stderr, "Results: %d   ", numResults)
			fmt.Fprintf(os.Stderr, "Errors: %d   ", numErrors)
		}
		fmt.Fprintf(os.Stderr, "\n")
	}
}

func deleteCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess delete [<job>]`

	deleteArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	jobId, ok := deleteArgs["<job>"].(string)

	if ok {
		err = deleteJob(jobId)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
	} else {
		err = deleteJobs()
		if err != nil {
			fmt.Println(err.Error())
			return
		}
	}
}

func errorsCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess errors <job> [<path>]`

	errorsArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	path, _ := errorsArgs["<path>"].(string)
	num := 0
	channel := make(chan int, 1000)

	showStatus := path != "" && path != "-"

	if showStatus {
		go func() {
			for {
				num = <-channel
				fmt.Printf("Number of errors: %d\r", num)
			}
		}()
	}

	num, err = getErrors(errorsArgs["<job>"].(string), path, channel)
	if err != nil {
		fmt.Println(err.Error())
	}

	if showStatus {
		fmt.Printf("Number of errors: %d\n", num)
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

	fmt.Printf("%-36s   %-19s   %-8s   %-6s\n", "Id", "Created", "Tasks", "Status")
	for _, job := range jobs {
		fmt.Printf("%-36s   %-19s   %8d   %-6s\n",
			job.Id,
			job.Created.Local().Format("2006-01-02 15:04:05"),
			job.Total,
			job.Status)
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
	channel := make(chan int, 1000000)

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

	fmt.Printf("%-13s %s\n", "Id", job.Id)
	fmt.Printf("%-13s %s\n", "Created", job.Created.Local().Format("2006-01-02 15:04:05"))
	fmt.Printf("%-13s %s\n", "Modified", job.Modified.Local().Format("2006-01-02 15:04:05"))
	fmt.Printf("%-13s %s\n", "Status", job.Status)
	fmt.Printf("%-13s %.2f\n", "Bid", job.Bid)
	fmt.Printf("%-13s %s\n", "Group", job.Group)
	fmt.Printf("%-13s %.2f\n", "Browser hours", float64(job.BrowserHours)/1000/60/60)
	fmt.Printf("%-13s %d\n", "Pending", job.Total-job.Finished-job.Failed)
	fmt.Printf("%-13s %d\n", "Failed", job.Failed)
	fmt.Printf("%-13s %d\n", "Finished", job.Finished)
	fmt.Printf("%-13s %d\n", "Total", job.Total)
}

func uploadCmd(argv []string) {
	var err error

	usage := `Usage: crowdprocess upload <job> <tasks>`

	uploadArgs, err := docopt.Parse(usage, argv, true, "crowdprocess "+VERSION, false)
	if err != nil {
		panic(err.Error())
	}

	submitTasks(uploadArgs["<job>"].(string), uploadArgs["<tasks>"].(string), nil)
}
