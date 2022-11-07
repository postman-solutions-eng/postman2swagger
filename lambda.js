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

exports.handler =  async function(event, context) {
  const body = JSON.parse(event.body);
  const postmanCollectionJSON = body.postmanCollectionJSON;
  const result = convertPostmanToSwagger(postmanCollectionJSON);
  if (result.success) {
    return {
      statusCode: 200,
      body: result.swagger
    }
  }
  else {
    return {
      statusCode: 400,
      body: "Error Processing Postman Collection"
    }
  }
}