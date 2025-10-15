Tech Stack

    Node.js + Express
    MongoDB + Mongoose
    Joi (schema validation)
    Used Groq openAi
    Helmet, CORS, express-rate-limit, morgan

Features

    Ticket can be created, read, updated & deleted

I did all the testing using postman to make sure all my crud functionalities for the tickets are working.


git clone https://github.com/HasannShd/ai-inbox-backend
    npm i 
    npm run dev 

[health check](screenshots/health.png)
[Aiextract](screenshots/AI-extract.png)
[create ticket](screenshots/Ticket-create.png)
[view ticket](screenshots/ticket-view.png)
[delete ticket](screenshots/delete%20ticket.png)
[update ticket](screenshots/Update-by-id.png)

there is middleware for vaidation 

the ai is given the conditions as per the test requirements if message contains urgent words it gives high priority otherwise if within 48hrs detected is medium and otherwise low

testing has been done multiple times to make sure of functionality 

# .env.example 
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/<db-name>?retryWrites=true&w=majority
AI_BASE_URL=https://api.groq.com/openai
AI_API_KEY=sk-... # put your Groq key here
AI_MODEL=llama-3.1-8b-instruct

