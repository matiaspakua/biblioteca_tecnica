function onReporteEstadoLibros(e) {
    var emailSolicitante = e.values[1];
    var reporteLibros = generarReporteLibros();
    
    // Enviar el reporte por correo al solicitante
    MailApp.sendEmail(emailSolicitante, "Estado de los libros en la biblioteca", reporteLibros);
  }
  
  // Función para generar el reporte de libros
  function generarReporteLibros() {
    var hojaLibros = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("libros");
    var hojaPrestamos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("prestamos");
  
    // Obtener los datos de ambas hojas
    var librosData = hojaLibros.getDataRange().getValues();
    var prestamosData = hojaPrestamos.getDataRange().getValues();
    
    // Variables para almacenar libros "libres" y "prestados"
    var librosLibres = [];
    var librosPrestados = [];
  
    // Índices de columnas (basado en la hoja "libros")
    var tituloCol = 0; // Columna A: Título del libro
    var estadoCol = 2; // Columna C: Estado ("libre" o "prestado")
  
    // Iterar sobre los libros y clasificar entre libres y prestados
    for (var i = 1; i < librosData.length; i++) { // Empezar en 1 para saltar los encabezados
      var tituloLibro = librosData[i][tituloCol];
      var estadoLibro = librosData[i][estadoCol];
      
      if (estadoLibro === "libre") {
        librosLibres.push(tituloLibro);
      } else if (estadoLibro === "prestado") {
        // Buscar la fecha de devolución del libro prestado en la hoja "prestamos"
        var fechaDevolucion = buscarFechaDevolucion(prestamosData, tituloLibro);
        librosPrestados.push(tituloLibro + " - Fecha de devolución: " + fechaDevolucion);
      }
    }
  
    // Construir el reporte de libros
    var reporte = "Reporte de estado de libros en la biblioteca:\n\n";
    
    // Listar libros libres
    if (librosLibres.length > 0) {
      reporte += "Libros libres:\n";
      reporte += librosLibres.join("\n") + "\n\n";
    } else {
      reporte += "No hay libros disponibles en este momento.\n\n";
    }
  
    // Listar libros prestados
    if (librosPrestados.length > 0) {
      reporte += "Libros prestados:\n";
      reporte += librosPrestados.join("\n") + "\n";
    } else {
      reporte += "No hay libros prestados en este momento.\n";
    }
  
    return reporte;
  }
  
  // Función para buscar la fecha de devolución de un libro en la hoja "prestamos"
  function buscarFechaDevolucion(prestamosData, tituloLibro) {
    var fechaDevolucionCol = prestamosData[0].length - 1; // Última columna para fecha de devolución
  
    // Iterar sobre la hoja "prestamos" para encontrar el último préstamo del libro
    for (var i = prestamosData.length - 1; i >= 1; i--) {
      if (prestamosData[i][0] === tituloLibro) { // Columna 0 tiene el título del libro
        return prestamosData[i][fechaDevolucionCol]; // Retorna la fecha de devolución
      }
    }
    
    return "Fecha no disponible"; // Si no se encuentra el préstamo
  }
  