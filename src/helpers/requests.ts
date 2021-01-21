/**
 * Quick function to send HTTP requests to an external address
 *
 * @param {string} url URL to send request to
 * @param {string} method HTTP method (GET by default)
 * @param {*} headers Headers to add to request, as a JSON with key/value pairs per each header
 * @param {*} body Body to add to request, as a JSON object
 * @return {*} The response of the request. If the response is a JSON object, it will be parsed.
 *
 */
export async function sendRequest(
  url: string,
  method?: string,
  headers?: any,
  body?: any
) {
  try {
    let propsObject: requestData = {
      method: method ? method : 'GET'
    }

    if (headers) {
      propsObject.headers = headers
    }

    if (body) {
      propsObject.body = JSON.stringify(body)
    }

    let response = await fetch(url, propsObject)
    try {
      let json = await response.json()
      return json
    } catch {
      return response
    }
  } catch (error) {
    log('error fetching from ', url, ' : ', error)
  }
}

/**
 * Data to construct an HTTP Request
 *
 * @typedef {Object} requestData
 * @property {string} method The HTTP method (GET, POST, DELETE, PUT, etc)
 * @property {any} headers An object with optional headers to send with the request
 * @property {string} body A stringified JSON to use as a body on a request
 *
 */
export type requestData = {
  method: string
  headers?: any
  body?: string
}
