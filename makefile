start:
	forever start  -c "node --harmony" --minUptime 1000 --spinSleepTime 1000 --uid pack -a app.js

stop:
	forever stop pack

restart:
	git pull
	make stop
	make start
