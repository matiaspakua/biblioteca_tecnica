const DIAS_PRESTAMO = 21;
const DIAS_PRIMER_AVISO = 5;
const DIAS_SEGUNDO_AVISO = 2;
const FORM_SOLICITUD_ID = '1Qbr5Coww0-4MP-TBpkh2JmMvJe3V9dOZ-gX1oarYPts';
const FORM_DEVOLUCION_ID = '1rxjZBbYxDk1EVGu5HylH4wY3e5E9A4KhxOvLeTpoEyU';
const PESTANIA_LIBROS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('libros');
const PESTANIA_PRESTAMOS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('prestamos');
const ESTADO_PRESTADO = 'prestado';
const ESTADO_LIBRE = 'libre';


function actualizarFormulario(e) {
  var currentFormId;
  for (var i = 0; i<e.values.length; i++){
    if(e.values[i] === 'Préstamo'){
      currentFormId = FORM_SOLICITUD_ID;
    }
    if(e.values[i] === 'Devolución'){
      currentFormId = FORM_DEVOLUCION_ID;
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
