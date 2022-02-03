const express = require('express');
const fs = require('fs');
const axios = require('axios');

/*
Load ENV
 */
const dataFilePath = process.env.DATA_FILE_PATH || 'data.txt';
const endpoint = process.env.ENDPOINT || 'https://eleuther-ai-gpt-j-6b-float16-text-generation-api-ainize-team.endpoint.ainize.ai/predictions/text-generation';
const port = process.env.PORT || 3000;

/*
Load Data for AINFT ChatBot
 */
const data = fs.readFileSync(dataFilePath, 'utf-8');

const app = express()
app.use(express.json());

/*
Get Metadata
 */
app.get('/', (req, res) => {
    res.send({
        inferenceParameters: {
            temperature: 0.9,
            top_p: 0.95,
            repetition_penalty: 0.8,
            do_sample: true,
            top_k: 50,
            length: 50
        }
    })
})

/*
Postprocessing for ChatBot
 */
const processingResponse = (responseText) => {
    let retText = "";
    for (let i = 0; i < responseText.length; i++) {
        if (responseText[i] === "\n" || responseText.substr(i, i + 7) === "Human: " || responseText.substr(i, i + 4) === "AI: ")
            break
        retText += responseText[i]
    }
    return retText.trim();
}

app.post('/chat', async (req, res) => {
    const {text_inputs} = req.body;
    const prompt = `${data}\nHuman: ${text_inputs}\nAI:`
    const responseData = await axios.post(endpoint, {
        text_inputs: prompt,
        temperature: 0.9,
        top_p: 0.95,
        repetition_penalty: 0.8,
        do_sample: true,
        top_k: 50,
        length: 50
    });
    const responseText = responseData.data[0].substr(prompt.length);
    res.send({text: processingResponse(responseText)});
});

app.listen(port, () => {
    console.log(`app listening on port ${app.get('port')}`);
});
