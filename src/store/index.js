import { EventEmitter } from 'events'
//解决浏览器对fetch方法的原生支持
import 'fetch-detector'
import 'fetch-ie8'

const store = new EventEmitter()
const url ='http://10.136.21.21:8090/test/test=true&action=getcase&page=1'

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
  return response.json()
}

store.fetchItems = (api) => {
  return fetch(api, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    mode: 'no-cors'
  })
  .then(checkStatus)
  .then(parseJSON)
  .then(function(data) {
    console.log('request succeeded with JSON response', data);})
  .catch(err => {
    console.log(err)
  })
}
store.fetchItemsByTag = (param) => {
  const api = url + param;
  return store.fetchItems(api)
}

export default store