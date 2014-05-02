package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"
)

var JOBS_ADDRESS = ADDRESS + "/jobs"

type Job struct {
	Id           string
	Created      time.Time
	Modified     time.Time
	Status       string
	Bid          float64
	Group        string
	BrowserHours int
	Failed       int
	Finished     int
	Total        int
}

func createJob(programPath string, bid string, group string) (string, error) {
	var err error

	program, err := os.Open(programPath)
	if err != nil {
		return "", err
	}

	// Prepare multipart request
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("program", "program.js")
	if err != nil {
		return "", err
	}

	_, err = io.Copy(part, program)
	if err != nil {
		return "", err
	}

	if bid != "" {
		err = writer.WriteField("bid", bid)
		if err != nil {
			return "", err
		}
	}

	if group != "" {
		err = writer.WriteField("group", group)
		if err != nil {
			return "", err
		}
	}

	err = writer.Close()
	if err != nil {
		return "", err
	}

	request, err := http.NewRequest("POST", JOBS_ADDRESS, body)
	if err != nil {
		return "", err
	}

	request.Header.Set("Content-Type", writer.FormDataContentType())

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return "", err
	}

	if response.StatusCode == 401 {
		return "", errors.New("Authentication failed")
	}

	if response.StatusCode != 201 {
		return "", errors.New("Something went wrong")
	}

	var job struct {
		Id string
	}

	decoder := json.NewDecoder(response.Body)
	err = decoder.Decode(&job)
	if err != nil {
		return "", err
	}

	return job.Id, nil
}

func listJobs() ([]Job, error) {
	var err error

	request, err := http.NewRequest("GET", JOBS_ADDRESS, nil)
	if err != nil {
		return nil, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}

	if response.StatusCode == 401 {
		return nil, errors.New("Authentication failed")
	}

	if response.StatusCode != 200 {
		return nil, errors.New("Something went wrong")
	}

	jobs := make([]Job, 0)

	decoder := json.NewDecoder(response.Body)
	err = decoder.Decode(&jobs)
	if err != nil {
		return nil, err
	}

	return jobs, nil
}

func showJob(id string) (*Job, error) {
	var err error

	request, err := http.NewRequest("GET", JOBS_ADDRESS+"/"+id, nil)
	if err != nil {
		return nil, err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}

	if response.StatusCode == 401 {
		return nil, errors.New("Authentication failed")
	}

	if response.StatusCode != 200 {
		return nil, errors.New("Something went wrong")
	}

	job := new(Job)

	decoder := json.NewDecoder(response.Body)
	err = decoder.Decode(job)
	if err != nil {
		return nil, err
	}

	return job, nil
}

func deleteJob(id string) error {
	var err error

	request, err := http.NewRequest("DELETE", JOBS_ADDRESS+"/"+id, nil)
	if err != nil {
		return err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return err
	}

	if response.StatusCode == 401 {
		return errors.New("Authentication failed")
	}

	if response.StatusCode != 204 {
		return errors.New("Something went wrong")
	}

	return nil
}

func deleteJobs() error {
	var err error

	request, err := http.NewRequest("DELETE", JOBS_ADDRESS, nil)
	if err != nil {
		return err
	}

	authenticateRequest(request)

	response, err := client.Do(request)
	if err != nil {
		return err
	}

	if response.StatusCode == 401 {
		return errors.New("Authentication failed")
	}

	if response.StatusCode != 204 {
		return errors.New("Something went wrong")
	}

	return nil
}
