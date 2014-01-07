package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
)

const TASKS_ADDRESS = JOBS_ADDRESS + "/%s/tasks"
const RESULTS_ADDRESS = JOBS_ADDRESS + "/%s/results"
const RESULTS_STREAM_ADDRESS = JOBS_ADDRESS + "/%s/results?stream"
const ERRORS_ADDRESS = JOBS_ADDRESS + "/%s/errors"
const ERRORS_STREAM_ADDRESS = JOBS_ADDRESS + "/%s/errors?stream"

func submitTasks(jobId string, tasksPath string, channel chan int) (int, error) {
	var err error

	address := fmt.Sprintf(TASKS_ADDRESS, jobId)

	var tasks *os.File

	if tasksPath != "" && tasksPath != "-" {
		tasks, err = os.Open(tasksPath)
		if err != nil {
			panic(err.Error())
		}
	} else {
		tasks = os.Stdin
	}

	reader, writer := io.Pipe()
	num := 0

	go func() {
		decoder := json.NewDecoder(tasks)
		for {
			task := new(json.RawMessage)
			err = decoder.Decode(task)
			if err != nil {
				if err == io.EOF {
					break
				}
				panic(err.Error())
			}

			_, err = writer.Write(append(*task, '\n'))
			if err != nil {
				panic(err.Error())
			}

			num++
			select {
			case channel <- num:
			default:
			}
		}
		err = writer.Close()
		if err != nil {
			panic(err.Error())
		}
	}()

	request, err := http.NewRequest("POST", address, reader)
	if err != nil {
		panic(err.Error())
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		panic(err.Error())
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
	}

	if response.StatusCode != 201 {
		return 0, errors.New("Something went wrong")
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
			panic(err.Error())
		}
	} else {
		results = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		panic(err.Error())
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		panic(err.Error())
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
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
			panic(err.Error())
		}

		_, err = results.Write(append(*result, '\n'))
		if err != nil {
			panic(err.Error())
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
			panic(err.Error())
		}
	} else {
		erros = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		panic(err.Error())
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		panic(err.Error())
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
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
			panic(err.Error())
		}

		if errorsPath != "" {
			_, err = erros.Write(append(*erro, '\n'))
			if err != nil {
				panic(err.Error())
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
			panic(err.Error())
		}
	} else {
		results = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		panic(err.Error())
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		panic(err.Error())
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
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

			panic(err.Error())
		}

		_, err = results.Write(append(*data, '\n'))
		if err != nil {
			panic(err.Error())
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
			panic(err.Error())
		}
	} else {
		erros = os.Stdout
	}

	request, err := http.NewRequest("GET", address, nil)
	if err != nil {
		panic(err.Error())
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		panic(err.Error())
	}

	if response.StatusCode == 401 {
		return 0, errors.New("Authentication failed")
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

			panic(err.Error())
		}

		_, err = erros.Write(append(*data, '\n'))
		if err != nil {
			panic(err.Error())
		}

		num++
		select {
		case channel <- num:
		default:
		}
	}

	return num, nil
}
