PREFIX = /usr/local


all: crowdprocess

crowdprocess:
	@go build -o crowdprocess
	# @GOOS=linux GOARCH=amd64 go build -o crowdprocess-linux-amd64
	# @GOOS=linux GOARCH=386 go build -o crowdprocess-linux-386
	# @GOOS=linux GOARCH=arm go build -o crowdprocess-linux-arm
	# @GOOS=windows GOARCH=386 go build -o crowdprocess-win
	# @GOOS=darwin GOARCH=amd64 go build -o crowdprocess-darwin-amd64

clean:
	rm -f cli

install: all
	install -D crowdprocess $(DESTDIR)$(PREFIX)/bin/crowdprocess

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/crowdprocess

.PHONY: all crowdprocess clean install uninstall
