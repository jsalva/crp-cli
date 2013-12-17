PREFIX = /usr/local


all: crowdprocess

crowdprocess:
	@go build -ldflags "-X main.VERSION 0.1" -o crowdprocess

clean:
	rm -f cli

install: all
	install -D crowdprocess $(DESTDIR)$(PREFIX)/bin/crowdprocess

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/crowdprocess

.PHONY: all crowdprocess clean install uninstall
