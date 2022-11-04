const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const p2s = require('postman-to-swagger');

const convertPostmanToSwagger = postmanCollectionJSON => {
  const conversionOptions = {
    target_spec: "swagger2.0"
  };
  try {
    const swagger = p2s(postmanCollectionJSON,conversionOptions);
    return {
      success: true,
      swagger: swagger
    };
  }
  catch (e) {
    return {
      success: false,
      error: e
    };
  }
}

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req,res) => {
  const postmanCollectionJSON = req.body.postmanCollectionJSON;
  const result = convertPostmanToSwagger(postmanCollectionJSON);
  if (result.success) {
    res.send(result.swagger);
  }
  else {
    res.status(400);
    res.send({message: "Error processing Postman Collection"});
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})