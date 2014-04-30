package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	// "runtime"

	"bitbucket.org/kardianos/osext"
	"github.com/mcuadros/go-version"
)

var LATEST_VERSION_ADDRESS = ADDRESS + "/cli/versions/latest"

func newerVersion() (bool, string) {
	var err error

	response, err := client.Get(LATEST_VERSION_ADDRESS)
	if err != nil {
		panic(err.Error())
	}

	if response.StatusCode != 200 {
		fmt.Println("Something went wrong")
		return false, ""
	}

	var latestVersion struct {
		Id  string
		Url string
	}

	decoder := json.NewDecoder(response.Body)
	err = decoder.Decode(latestVersion)
	if err != nil {
		panic(err.Error())
	}

	if version.Compare(latestVersion.Id, VERSION, ">") {
		return true, latestVersion.Url
	}

	return false, ""
}

func upgrade() {
	var err error

	exe, err := osext.Executable()
	if err != nil {
		panic(err.Error())
	}

	path, err := osext.ExecutableFolder()
	if err != nil {
		panic(err.Error())
	}

	file, err := ioutil.TempFile(path, ".crp-")
	if err != nil {
		panic(err.Error())
	}
	defer file.Close()
	defer os.Remove(file.Name())

	resp, err := http.Get("https://crowdprocess.com")
	if err != nil {
		panic(err.Error())
	}
	defer resp.Body.Close()

	_, err = io.Copy(file, resp.Body)
	if err != nil {
		panic(err.Error())
	}

	err = os.Rename(file.Name(), exe)
	if err != nil {
		panic(err.Error())
	}
}
