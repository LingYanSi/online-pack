start:
	forever start  -c "node --harmony" --minUptime 1000 --spinSleepTime 1000 --uid pack -a app.js
restart:
	git pull
	forever restart pack
stop:
	forever stop pack
