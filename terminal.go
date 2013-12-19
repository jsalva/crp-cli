// +build !windows,!linux,!cgo

package main

import (
	"os"
)

// see https://github.com/pebbe/util
func isTerminal(file *os.File) bool {
	return true
}
