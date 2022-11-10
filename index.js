const Converter = require('api-spec-converter');
const { transpile } = require('postman2openapi');


const transformPostmantoOAS = postmanCollectionJSON => {
  try {
    const openapi = transpile(postmanCollectionJSON);
    console.log(openapi);
    return {
      success: true,
      oas: openapi
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      error: new Error(e.message)
    }
  }
}


const convertPostmanToSwagger = async postmanCollectionJSON => {
  const result = transformPostmantoOAS(postmanCollectionJSON);
  if (result.success) {
    try {
      const conversionOptions = {
        from: 'openapi_3',
        to: 'swagger_2',
        source = result.oas
      };
      const converted = await Converter.convert(conversionOptions);
      const conversionValidationResult = await converted.validate();
      return {
        success: true,
        swagger: converted.stringify(),
        errors: conversionValidationResult.errors,
        warnings: conversionValidationResult.warnings
      }
    }
    catch (e) {
      return {
        success: false,
        errors: [new Error(e.message)]
      }
    }
  }
  else {
    return {
      success: false,
      errors: [result.error]
    }
  }
}

exports.handler =  async function(event) {
  if (!event.body) {
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: 400,
      body: JSON.stringify({message: 'Please include the postman collection JSON'})
    }
  }
  console.log(JSON.stringify(event));
  const postmanCollectionJSON = JSON.parse(event.body);
  console.log(postmanCollectionJSON);
  const result = await convertPostmanToSwagger(postmanCollectionJSON);
  if (result.success) {
    const responsePayload = {
      swagger: JSON.parse(result.swagger),
      errors: result.errors,
      warnings: result.warnings
    }
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: 200,
      body: JSON.stringify(responsePayload)
    };
  }
  else {
    const responsePayload = {
      message: 'Error converting Postman collection to Swagger',
      errors: result.errors
    }
    return {
      headers: {
        'Content-Type': 'application/json'
      },
      statusCode: 400,
      body: JSON.stringify(responsePayload)
    }
  }
}