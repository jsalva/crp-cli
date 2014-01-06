PREFIX = /usr/local


all: crowdprocess

crowdprocess:
	@go build -o crowdprocess-linux-amd64
	@GOARCH=386 go build -o crowdprocess-linux-386
	@GOARCH=arm go build -o crowdprocess-linux-arm
	# @GOARCH=386 GOOS=windows go build -o crowdprocess-win

clean:
	rm -f cli

install: all
	install -D crowdprocess $(DESTDIR)$(PREFIX)/bin/crowdprocess

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/crowdprocess

.PHONY: all crowdprocess clean install uninstall
