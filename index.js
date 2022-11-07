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
    return {
      success: false,
      error: new Error(e)
    }
  }
}


const convertPostmanToSwagger = async postmanCollectionJSON => {
  const result = transformPostmantoOAS(postmanCollectionJSON);
  const conversionOptions = {
    from: 'openapi_3',
    to: 'swagger_2'
  }
  if (result.success) {
    conversionOptions.source = result.oas;
    const converted = await Converter.convert(conversionOptions);
    const conversionValidationResult = await converted.validate();
    return {
      success: true,
      swagger: converted.stringify(),
      errors: conversionValidationResult.errors,
      warnings: conversionValidationResult.warnings
    }
  }
  else {
    return {
      success: false,
      errors: new Error(result.error)
    }
  }
}

exports.handler =  async function(event, context) {
  const postmanCollectionJSON = JSON.parse(event.body);
  const result = await convertPostmanToSwagger(postmanCollectionJSON);
  if (result.success) {
    const responsePayload = {
      swagger: JSON.parse(result.swagger),
      errors: result.errors,
      warnings: result.warnings
    }
    return {
      statusCode: 200,
      body: responsePayload
    };
  }
  else {
    const responsePayload = {
      message: 'Error converting Postman collection to Swagger',
      errors: result.errors
    }
    return {
      statusCode: 400,
      body: responsePayload
    }
  }
}