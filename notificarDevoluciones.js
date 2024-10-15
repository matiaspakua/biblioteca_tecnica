function notificarDevoluciones() {
    var hojaLibros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("libros");
    var hojaPrestamos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("prestamos");
    var librosData = hojaLibros.getDataRange().getValues();
    var prestamosData = hojaPrestamos.getDataRange().getValues();
    var tituloCol = 0; 
    var estadoCol = 2;

    var tituloPrestamosCol = 3; 
    var correoPrestamosCol = 2; 
    var fechaDevolucionCol = hojaPrestamos.getLastColumn(); 
    var fechaActual = new Date();
  
    for (var i = 1; i < librosData.length; i++) { 
      var tituloLibro = librosData[i][tituloCol];
      var estadoLibro = librosData[i][estadoCol];
  
      if (estadoLibro === "prestado") {
  
        var ultimoPrestamo = buscarUltimoPrestamo(prestamosData, tituloLibro, tituloPrestamosCol);
   
        if (ultimoPrestamo) {
          var correo = ultimoPrestamo[correoPrestamosCol];
          var fechaDevolucion = new Date(ultimoPrestamo[6]);
          var diasRestantes = Math.ceil((fechaDevolucion - fechaActual) / (1000 * 60 * 60 * 24));

          if (diasRestantes === 5 || diasRestantes === 2) {
            enviarCorreoNotificacion(correo, tituloLibro, diasRestantes);
          }
        }
      }
    }
  }
  
  function buscarUltimoPrestamo(prestamosData, tituloLibro, tituloPrestamosCol) {
    var ultimoRegistro = null;
    for (var i = prestamosData.length - 1; i >= 1; i--) { 
      if (prestamosData[i][3] === tituloLibro) {
        ultimoRegistro = prestamosData[i];
        Logger.log(ultimoRegistro);
        break; 
      }
    }
  
    return ultimoRegistro;
  }
  
  function enviarCorreoNotificacion(correo, tituloLibro, diasRestantes) {
    var asunto = "Recordatorio de Devolución: " + tituloLibro;
    var mensaje = "Estimado usuario,\n\n" +
                  "Este es un recordatorio de que el libro \"" + tituloLibro + "\" que has tomado prestado está próximo a vencer.\n" +
                  "Faltan " + diasRestantes + " días para la fecha de devolución.\n\n" +
                  "Por favor, asegúrate de devolverlo a tiempo.\n\n" +
                  "Saludos,\n" +
                  "La Biblioteca";
    Logger.log(correo);

    MailApp.sendEmail(correo, asunto, mensaje);
    Logger.log("Correo enviado a " + correo + " para el libro " + tituloLibro + " (faltan " + diasRestantes + " días).");
  }