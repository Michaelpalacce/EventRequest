If you want to run the tests, you have to have docker and docker compose installed and then run

~~~shell
docker-compose up -d --build
~~~

You can run it without the -d flag if you want to keep an eye of the logs.

Feel free to use `dc up -d node-test` for testing purposes with whichever NodeJS version you want ( uncomment it first in the docker-compose.yml file ). 