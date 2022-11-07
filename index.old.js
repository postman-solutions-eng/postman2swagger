const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const Converter = require('api-spec-converter');
const { transpile } = require('postman2openapi');


const https = require('https');

// const httpTransformPostmanToOAS = collectionJSON => {
//   const options = {
//     hostname: 'demo.postmansolutions.com',
//     path: '/postman2openapi',
//     method: 'POST',
//     port: 443, // 👈️ replace with 80 for HTTP requests
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   };

//   return new Promise((resolve, reject) => {
//     const req = https.request(options, res => {
//       let rawData = '';

//       res.on('data', chunk => {
//         rawData += chunk;
//       });

//       res.on('end', () => {
//         try {
//           console.log(rawData);
//           resolve({
//             success: true,
//             oas: JSON.parse(rawData)
//           });
//         } catch (err) {
//           reject({
//             success: false,
//             error: new Error(err)
//           });
//         }
//       });
//     });

//     req.on('error', err => {
//       reject({success: false, error: new Error(err)});
//     });

//     // 👇️ write the body to the Request object
//     req.write(JSON.stringify(collectionJSON));
//     req.end();
//   });
// }

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

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', async (req,res) => {
  const postmanCollectionJSON = req.body;
  const result = await convertPostmanToSwagger(postmanCollectionJSON);
  if (result.success) {
    const responsePayload = {
      swagger: JSON.parse(result.swagger),
      errors: result.errors,
      warnings: result.warnings
    }
    res.send(responsePayload);
  }
  else {
    res.status(400);
    const responsePayload = {
      message: 'Error converting Postman collection to Swagger',
      errors: result.errors
    }
    res.send(responsePayload);
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// module.exports = app;
