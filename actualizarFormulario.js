const DIAS_PRESTAMO = 21;
const DIAS_PRIMER_AVISO = 5;
const DIAS_SEGUNDO_AVISO = 2;
const FORM_SOLICITUD_ID = '1Qbr5Coww0-4MP-TBpkh2JmMvJe3V9dOZ-gX1oarYPts';
const FORM_DEVOLUCION_ID = '1rxjZBbYxDk1EVGu5HylH4wY3e5E9A4KhxOvLeTpoEyU';
const FORM_REPORTE_ID = '1MxFCx0I4pZf8ZQQ2woOjoLSYmS30MwzbUFMCXeo52xk'
const PESTANIA_LIBROS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('libros');
const PESTANIA_PRESTAMOS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('prestamos');
const ESTADO_PRESTADO = 'prestado';
const ESTADO_LIBRE = 'libre';


function actualizarFormulario(e) {
  var currentFormId;
  for (var i = 0; i<e.values.length; i++){

    var tipo = e.values[i]; 
    if(tipo === 'Préstamo'){
      currentFormId = FORM_SOLICITUD_ID;
    }
    if(tipo === 'Devolución'){
      currentFormId = FORM_DEVOLUCION_ID;
    }
    if(tipo === 'Reporte de libros Disponibles'){
      currentFormId = FORM_REPORTE_ID;

      var reporteLibros = generarReporteLibros();
    
      // Enviar el reporte por correo al solicitante
      MailApp.sendEmail(emailSolicitante, "Estado de los libros en la biblioteca", reporteLibros);
      return;
    }
    
  }
  
  var formSolicitud = FormApp.openById(currentFormId);
  var formResponses = formSolicitud.getResponses();
  var formResponse = formResponses[formResponses.length-1];
  var itemResponses = formResponse.getItemResponses();

  var libroSeleccionado;

  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];
    if(itemResponse.getItem().getTitle() === 'Seleccionar Libro')
      libroSeleccionado = itemResponse.getResponse();
  }
  
  var data = PESTANIA_LIBROS.getRange('A2:A10').getValues();


  if (currentFormId === FORM_SOLICITUD_ID) {
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === libroSeleccionado) {
        var celdaEstado = PESTANIA_LIBROS.getRange(i + 2, 3);
        
        if(celdaEstado.getValue() === ESTADO_LIBRE){
          Logger.log("Actualizando libro %s de %s a %s.", data[i][0], celdaEstado.getValue(),ESTADO_PRESTADO)
          celdaEstado.setValue(ESTADO_PRESTADO);
        }
        break;
      }
    }
    actualizarFechaDevolucion(PESTANIA_PRESTAMOS);
  }
  
  if (currentFormId === FORM_DEVOLUCION_ID) {
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === libroSeleccionado) {
        var celdaEstado = PESTANIA_LIBROS.getRange(i + 2, 3);
        if(celdaEstado.getValue() === ESTADO_PRESTADO){
          Logger.log("Actualizando libro %s de %s a %s.", data[i][0], celdaEstado.getValue(),ESTADO_LIBRE)
          celdaEstado.setValue(ESTADO_LIBRE);
        }
        break;
      }
    }
  }
  actualizarDropdowns();
}
  
function actualizarDropdowns() {
  var formSolicitud = FormApp.openById(FORM_SOLICITUD_ID);
  var formDevolucion = FormApp.openById(FORM_DEVOLUCION_ID);  
  var data = PESTANIA_LIBROS.getRange('A2:A10').getValues();
  var status = PESTANIA_LIBROS.getRange('C2:C10').getValues();

  var librosLibres = data
    .map(function(item, index) {
      return status[index][0] === ESTADO_LIBRE ? item[0] : null; 
    })
    .filter(Boolean); 
  
  var librosPrestados = data
    .map(function(item, index) {
      return status[index][0] === ESTADO_PRESTADO ? item[0] : null; 
    })
    .filter(Boolean); 

  var itemsSolicitud = formSolicitud.getItems(FormApp.ItemType.LIST); 
  var dropdownSolicitud = itemsSolicitud[0].asListItem();
  dropdownSolicitud.setChoiceValues(librosLibres);

  var itemsDevolucion = formDevolucion.getItems(FormApp.ItemType.LIST); 
  var dropdownDevolucion = itemsDevolucion[0].asListItem(); 
  dropdownDevolucion.setChoiceValues(librosPrestados);
  
}

function actualizarFechaDevolucion(sheet) {
  var fechaDevolucion = new Date();
  fechaDevolucion.setDate(fechaDevolucion.getDate() + DIAS_PRESTAMO);

  var encabezados = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var columnaFechaDevolucion = encabezados.indexOf("Fecha devolución") + 1;

  if (columnaFechaDevolucion > 0) {
    var ultimaFila = sheet.getLastRow();
    sheet.getRange(ultimaFila, columnaFechaDevolucion).setValue(fechaDevolucion);
  } else {
    Logger.log('No se encontró la columna "Fecha Devolución".');
  }
}

// Función para generar el reporte de libros
function generarReporteLibros() {

  // Obtener los datos de ambas hojas
  var librosData = PESTANIA_LIBROS.getDataRange().getValues();
  var prestamosData = PESTANIA_PRESTAMOS.getDataRange().getValues();
  
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
