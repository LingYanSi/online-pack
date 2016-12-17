start:
	forever start  -c "node --harmony" --minUptime 1000 --spinSleepTime 1000 --uid pack -a app.js

stop:
	forever stop pack
	make stopwebp

restart:
	git pull
	make stop
	make start

stopwebp:
	ps aux | grep webpack | grep -v "grep" | awk '{print $$2}' | xargs kill -9
