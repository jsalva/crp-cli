package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
)

var TASKS_ADDRESS = JOBS_ADDRESS + "/%s/tasks"
var RESULTS_ADDRESS = JOBS_ADDRESS + "/%s/results"
var RESULTS_STREAM_ADDRESS = JOBS_ADDRESS + "/%s/results?stream"
var ERRORS_ADDRESS = JOBS_ADDRESS + "/%s/errors"
var ERRORS_STREAM_ADDRESS = JOBS_ADDRESS + "/%s/errors?stream"

func submitTasks(jobId string, tasksPath string, channel chan int) (int, error) {
	var err error

	address := fmt.Sprintf(TASKS_ADDRESS, jobId)

	var tasks *os.File

	if tasksPath != "" && tasksPath != "-" {
		tasks, err = os.Open(tasksPath)
		if err != nil {
			return 0, err
		}
	} else {
		tasks = os.Stdin
	}

	reader, writer := io.Pipe()
	num := 0

	var goerr error
	go func() {
		defer writer.Close()
		decoder := json.NewDecoder(tasks)
		for {
			task := new(json.RawMessage)
			goerr = decoder.Decode(task)
			if goerr != nil {
				if goerr == io.EOF {
					break
				}
				return
			}

			_, goerr = writer.Write(append(*task, '\n'))
			if goerr != nil {
				return
			}

			num++
			select {
			case channel <- num:
			default:
			}
		}
	}()

	request, err := http.NewRequest("POST", address, reader)
	if err != nil {
		return 0, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return 0, err
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
	}

	if response.StatusCode == 404 {
		return 0, errors.New("Job not found")
	}

	if response.StatusCode != 201 {
		return 0, errors.New("Something went wrong")
	}

	if goerr != nil {
		return num, goerr
	}

	return num, nil
}

func streamTaskResults(jobId string, resultsPath string, channel chan int) (int, error) {
	var err error

	address := fmt.Sprintf(RESULTS_STREAM_ADDRESS, jobId)

	var results *os.File

	if resultsPath != "" && resultsPath != "-" {
		results, err = os.Create(resultsPath)
		if err != nil {
			return 0, err
		}
	} else {
		results = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		return 0, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return 0, err
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
	}

	if response.StatusCode == 404 {
		return 0, errors.New("Job not found")
	}

	if response.StatusCode != 200 {
		return 0, errors.New("Something went wrong")
	}

	num := 0
	decoder := json.NewDecoder(response.Body)
	for {
		result := new(json.RawMessage)
		err = decoder.Decode(result)
		if err != nil {
			if err == io.EOF {
				break
			}
			return 0, err
		}

		_, err = results.Write(append(*result, '\n'))
		if err != nil {
			return 0, err
		}

		num++
		select {
		case channel <- num:
		default:
		}
	}

	return num, nil
}

func streamTaskErrors(jobId string, errorsPath string, channel chan int) (int, error) {
	var err error

	address := fmt.Sprintf(ERRORS_STREAM_ADDRESS, jobId)

	var erros *os.File

	if errorsPath != "" && errorsPath != "-" {
		erros, err = os.Create(errorsPath)
		if err != nil {
			return 0, err
		}
	} else {
		erros = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		return 0, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return 0, err
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
	}

	if response.StatusCode == 404 {
		return 0, errors.New("Job not found")
	}

	if response.StatusCode != 200 {
		return 0, errors.New("Something went wrong")
	}

	num := 0
	decoder := json.NewDecoder(response.Body)
	for {
		erro := new(json.RawMessage)
		err = decoder.Decode(erro)
		if err != nil {
			if err == io.EOF {
				break
			}
			return 0, err
		}

		if errorsPath != "" {
			_, err = erros.Write(append(*erro, '\n'))
			if err != nil {
				return 0, err
			}
		}

		num++
		select {
		case channel <- num:
		default:
		}
	}

	return num, nil
}

func getResults(jobId string, resultsPath string, channel chan int) (int, error) {
	var err error

	address := fmt.Sprintf(RESULTS_ADDRESS, jobId)

	var results *os.File

	if resultsPath != "" && resultsPath != "-" {
		results, err = os.Create(resultsPath)
		if err != nil {
			return 0, err
		}
	} else {
		results = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		return 0, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return 0, err
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
	}

	if response.StatusCode == 404 {
		return 0, errors.New("Job not found")
	}

	if response.StatusCode != 200 {
		return 0, errors.New("Something went wrong")
	}

	num := 0
	decoder := json.NewDecoder(response.Body)

	for {
		data := new(json.RawMessage)
		err = decoder.Decode(data)
		if err != nil {
			if err == io.EOF {
				break
			}

			return 0, err
		}

		_, err = results.Write(append(*data, '\n'))
		if err != nil {
			return 0, err
		}

		num++
		select {
		case channel <- num:
		default:
		}
	}

	return num, nil
}

func getErrors(jobId string, errorsPath string, channel chan int) (int, error) {
	var err error

	address := fmt.Sprintf(ERRORS_ADDRESS, jobId)

	var erros *os.File

	if errorsPath != "" && errorsPath != "-" {
		erros, err = os.Create(errorsPath)
		if err != nil {
			return 0, err
		}
	} else {
		erros = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		return 0, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return 0, err
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
	}

	if response.StatusCode == 404 {
		return 0, errors.New("Job not found")
	}

	if response.StatusCode != 200 {
		return 0, errors.New("Something went wrong")
	}

	num := 0
	decoder := json.NewDecoder(response.Body)

	for {
		data := new(json.RawMessage)
		err = decoder.Decode(data)
		if err != nil {
			if err == io.EOF {
				break
			}

			return 0, err
		}

		_, err = erros.Write(append(*data, '\n'))
		if err != nil {
			return 0, err
		}

		num++
		select {
		case channel <- num:
		default:
		}
	}

	return num, nil
}
