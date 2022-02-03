# ainft_test
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/openai/gpt-2/blob/master/LICENSE)

Auto-generated github repository by [Ainize Teachable NLP](https://ainize.ai/teachable-nlp)

## Health Check
Using `curl` in the terminal:
```
$ curl --request GET 'https://train-divetkaljcttg48xypy7-ainft-test-teachable-ainize.endpoint.dev.ainize.ai/ping'
{
  "status": "Healthy"
}
```

## Prediction Test

### Pre-processing for API
To use the API, the sentence must be converted into a vector form.

[Web](https://master-gpt2-text2vec-shyun-comcom.endpoint.ainize.ai/)
or using `curl` in the terminal:
```
$ curl --request POST 'https://main-gpt-2-server-gkswjdzz.endpoint.dev.ainize.ai/preprocess' \
	--header 'Content-Type: application/json' \
	--data-raw '{
		"context": "there is a boy"
	}'

"[8117, 318, 257, 2933]"
```

### Prediction
Using `curl` in the terminal:
```
$ curl --request POST 'https://train-divetkaljcttg48xypy7-ainft-test-teachable-ainize.endpoint.ainize.ai/predictions/gpt-j-en-6b-fewshot' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "text": [3666, 1438, 318, 14200, 11, 314, 16486, 1850, 287, 13851, 3783],
    "num_samples": 5,
    "length": 8
  }'


[
  [
    3666, 1438, 318, 14200, 11, 314, 16486, 1850, 287, 13851, 3783, 11, 314, 1101, 422, 262, 1294, 11, 523
  ],
  ...,
  [
    3666, 1438, 318, 14200, 11, 314, 16486, 1850, 287, 13851, 3783, 379, 262, 2059, 286, 520, 26414, 11, 543
  ]
]
``` 