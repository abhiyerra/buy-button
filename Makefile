VERSION := $(shell cat ../VERSION)

deps:
	npm install --prefix=. stripe

release:
	zip -r opszero-buy-button-with-stripe-$(VERSION).zip AcksinStoreExamplePolicy.json Makefile config.json.example download.js index.js invoice.js node_modules www
	curl -T opszero-buy-button-with-stripe-$(VERSION).zip ftp://ftp.sendowl.com --user $(SENDOWL_FTP_USER):$(SENDOWL_FTP_PASSWORD)
