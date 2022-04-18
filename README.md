# Api-Exercise
Node v16.14.2

The X_API_KEY is stored in a .env file which needs to be added for the code to run.

Challenges:
Multiple requests had to be done to the decryption api and finding a way to wait for all the requests to finish was challenging. 
Once this was figured out the tasks requiring the swapi api became easier.
Handling the case where the api was not available was challenging.

Improvements:
All tasks were done in sequence one after the other.
Doing the sequence in batches may improve the performance.
Running requests parallelly is another option to be explored.
