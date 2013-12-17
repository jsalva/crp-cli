package main

import (
	"os"
	"syscall"
	"unsafe"
)

func isTerminal(file *os.File) bool {
	var termios syscall.Termios
	_, _, err := syscall.Syscall6(syscall.SYS_IOCTL, file.Fd(),
		uintptr(syscall.TCGETS), uintptr(unsafe.Pointer(&termios)), 0, 0, 0)

	return err == 0
}
