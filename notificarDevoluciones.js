// Función que se ejecuta diariamente
function notificarDevoluciones() {
    var hojaLibros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("libros");
    var hojaPrestamos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("prestamos");
  
    // Obtener los datos de la hoja "libros"
    var librosData = hojaLibros.getDataRange().getValues();
    
    // Obtener los datos de la hoja "prestamos"
    var prestamosData = hojaPrestamos.getDataRange().getValues();
    
    // Suponemos que las columnas son: Título del libro (A), Estado (C), etc.
    var tituloCol = 0; // Columna 0 (A) tiene el título del libro
    var estadoCol = 2; // Columna 2 (C) tiene el estado ("prestado"/"libre")
  
    // Columnas en la hoja "prestamos"
    var tituloPrestamosCol = 0; // Título del libro en la columna A (índice 0)
    var correoPrestamosCol = 1; // Correo en la columna B (índice 1)
    var fechaDevolucionCol = hojaPrestamos.getLastColumn(); // La última columna tiene la fecha de devolución
    
    // Fecha actual
    var fechaActual = new Date();
  
    // Revisar cada libro
    for (var i = 1; i < librosData.length; i++) { // Empezamos en 1 para saltar los encabezados
      var tituloLibro = librosData[i][tituloCol];
      var estadoLibro = librosData[i][estadoCol];
  
      // Solo procesar libros en estado "prestado"
      if (estadoLibro === "prestado") {
        // Buscar el último registro de préstamo en la hoja "prestamos"
        var ultimoPrestamo = buscarUltimoPrestamo(prestamosData, tituloLibro, tituloPrestamosCol);
  
        if (ultimoPrestamo) {
          var correo = ultimoPrestamo[correoPrestamosCol];
          var fechaDevolucion = new Date(ultimoPrestamo[fechaDevolucionCol]);
          
          // Calcular la diferencia en días entre la fecha de devolución y la fecha actual
          var diasRestantes = Math.ceil((fechaDevolucion - fechaActual) / (1000 * 60 * 60 * 24));
  
          // Enviar correo si faltan 5 o 2 días
          if (diasRestantes === 5 || diasRestantes === 2) {
            enviarCorreoNotificacion(correo, tituloLibro, diasRestantes);
          }
        }
      }
    }
  }
  
  // Función para buscar el último préstamo de un libro específico en la hoja "prestamos"
  function buscarUltimoPrestamo(prestamosData, tituloLibro, tituloPrestamosCol) {
    var ultimoRegistro = null;
  
    // Iterar por los préstamos para encontrar el último registro del libro
    for (var i = prestamosData.length - 1; i >= 1; i--) { // Empezamos desde el final (registro más reciente)
      if (prestamosData[i][tituloPrestamosCol] === tituloLibro) {
        ultimoRegistro = prestamosData[i];
        break; // Al encontrar el último registro, terminamos la búsqueda
      }
    }
  
    return ultimoRegistro;
  }
  
  // Función para enviar el correo de notificación
  function enviarCorreoNotificacion(correo, tituloLibro, diasRestantes) {
    var asunto = "Recordatorio de Devolución: " + tituloLibro;
    var mensaje = "Estimado usuario,\n\n" +
                  "Este es un recordatorio de que el libro \"" + tituloLibro + "\" que has tomado prestado está próximo a vencer.\n" +
                  "Faltan " + diasRestantes + " días para la fecha de devolución.\n\n" +
                  "Por favor, asegúrate de devolverlo a tiempo.\n\n" +
                  "Saludos,\n" +
                  "La Biblioteca";
  
    // Enviar correo electrónico
    MailApp.sendEmail(correo, asunto, mensaje);
    Logger.log("Correo enviado a " + correo + " para el libro " + tituloLibro + " (faltan " + diasRestantes + " días).");
  }
  
  // Configuración del trigger para ejecutar diariamente
  function crearTriggerDiario() {
    ScriptApp.newTrigger('revisarPrestamos')
      .timeBased()
      .everyDays(1) // Ejecutar todos los días
      .atHour(8) // Hora a la que se ejecutará (8 AM)
      .create();
  }
  