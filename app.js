const express = require('express');
const fs = require('fs');
const axios = require('axios');
const Ain = require('@ainblockchain/ain-js').default;

/*
Load ENV
 */
const dataFilePath = process.env.DATA_FILE_PATH || 'data.txt';
const endpoint = process.env.ENDPOINT || 'https://eleuther-ai-gpt-j-6b-float16-text-generation-api-ainize-team.endpoint.ainize.ai';
const port = process.env.PORT || 3000;
const providerURL = process.env.PROVIDER_URL;
const ainizeInternalPrivateKey = process.env.AINIZE_INTERNAL_PRIVATE_KEY;

const generationEndPoint = `${endpoint}/predictions/text-generation`;
const healthCheckEndPoint = `${endpoint}/ping`;

const chainId = providerURL.includes('mainnet') ? 1 : 0
const ain = new Ain(providerURL, chainId);
const ainAddress = Ain.utils.toChecksumAddress(ain.wallet.add(ainizeInternalPrivateKey));
console.log(ainAddress)
ain.wallet.setDefaultAccount(ainAddress);


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

app.get('/ping', async (req, res) => {
    const responseData = await axios.post(healthCheckEndPoint);
    if(responseData.status === 200) {
        res.json(responseData.data);
    }else{
        res.json({status: "Unhealthy"})
    }
});

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

const chat = async (textInputs) => {
    const prompt = `${data}\nHuman: ${textInputs}\nAI:`
    const responseData = await axios.post(generationEndPoint, {
        text_inputs: prompt,
        temperature: 0.9,
        top_p: 0.95,
        repetition_penalty: 0.8,
        do_sample: true,
        top_k: 50,
        length: 50
    });
    const responseText = responseData.data[0].substr(prompt.length);
    return processingResponse(responseText);
}

const sendResponse = async (ref, message) => {
    console.log('send', ref, message);
    const res = await ain.db.ref(ref).setValue({
        value: message,
        nonce: -1,
    })
    console.log(res);
    return res;
}

app.post('/chat', async (req, res) => {
    const {text_inputs} = req.body;
    const botResponse = await chat(text_inputs);
    res.json({text: botResponse});
});

// Ainize Trigger
app.post('/trigger', async (req, res) => {
    console.log(req.body);
    if(!('transaction' in req.body) ||
        !('tx_body' in req.body.transaction) ||
        !('operation' in req.body.transaction.tx_body)
    ){
        console.error(`Invalid transaction : ${JSON.stringify(req.body)}`);
        res.status(400).json(`Invalid transaction : ${JSON.stringify(req.body)}`)
        return;
    }
    const transaction = req.body.transaction.tx_body.operation;
    const {type: tx_type} = transaction;
    if (tx_type !== 'SET_VALUE') {
        console.error(`Not supported transaction type : ${tx_type}`);
        res.status(400).json(`Not supported transaction type : ${tx_type}`);
        return;
    }
    try {
        const {value, ref} = transaction;
        const botResponse = await chat(value);
        const responseRef = ref.split('/').slice(0, -1).concat('response').join('/');
        const retValue = await sendResponse(responseRef, botResponse);
        res.json(retValue);
    } catch (error) {
        console.error(`Failed : ${error}`);
        res.status(500).json(`Failed : ${error}`);
    }
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
