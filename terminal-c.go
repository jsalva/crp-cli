// +build !windows,!linux,cgo

package main

/*
#include <unistd.h>
*/
import "C"

import "os"

func isTerminal(file *os.File) bool {
	return int(C.isatty(C.int(file.Fd()))) != 0
}
