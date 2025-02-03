function CHAT(val) {
  var properties = PropertiesService.getScriptProperties();
  
  // Generar una clave única basada en el hash del valor de entrada
  var propertyKey = 'CHAT_' + generateHash(val);
  
  // Intentar recuperar el resultado desde las propiedades
  var storedData = properties.getProperty(propertyKey);
  
  if (storedData) {
    // Parsear el resultado almacenado
    var storedObj = JSON.parse(storedData);
    var storedTime = storedObj.timestamp;

    // Verificar si el resultado es reciente (ejemplo: 24 horas)
    if (Date.now() - storedTime < 86400000) { // 86400000 ms = 1 día
      return storedObj.result;
    }
  }

  // Si no hay resultado o está desactualizado, realizar la llamada a la API
  var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("configuracion");
  var apiKey = configSheet.getRange(2,2).getValue(); //Celda B2
  var model = configSheet.getRange(3,2).getValue(); //Celda B3

  var data = {
    "messages": [
      {"role": "user", "content": val + "\n"}
    ],
    "model": model,
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(data),
    'headers': {
      Authorization: 'Bearer ' + apiKey,
    },
  };

  var response = UrlFetchApp.fetch(
    'https://api.openai.com/v1/chat/completions',
    options
  );

  var result = JSON.parse(response.getContentText())['choices'][0]['message']['content'];
  
  // Guardar el resultado con una marca de tiempo
  var dataToStore = JSON.stringify({ 
    result: result, 
    timestamp: Date.now() 
  });
  properties.setProperty(propertyKey, dataToStore);
  
  return result;
}

// Función para generar un hash del texto de entrada
function generateHash(input) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, input);
  return digest.map(function(byte) {
    return (byte + 256).toString(16).slice(-2);
  }).join('');
}
