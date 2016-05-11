VERSION := $(shell cat package.json | jq -r '.version')

deps: README.html
	npm install

install:
	terraform plan
	terraform apply

release:
	zip -r opszero-buy-button-with-stripe-$(VERSION).zip AcksinStoreExamplePolicy.json Makefile config.json.example download.js index.js invoice.js node_modules www
	cp opszero-buy-button-with-stripe-$(VERSION).zip output.zip
	curl -T opszero-buy-button-with-stripe-$(VERSION).zip ftp://ftp.sendowl.com --user $(SENDOWL_FTP_USER):$(SENDOWL_FTP_PASSWORD)

README.html:
	emacs README.org --batch --eval '(org-html-export-to-html nil nil nil t)'  --kill
	echo "---" > docs.html.erb
	echo "title: Serverless Buy Button Using Stripe" >> docs.html.erb
	echo "layout: docs" >> docs.html.erb
	echo "---" >> docs.html.erb
	cat README.html >> docs.html.erb
	rm README.html
	mv docs.html.erb ../../acksin/acksin.com/source/solutions/serverless-ecommerce-with-stripe.html.erb
