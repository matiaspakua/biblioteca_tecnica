var DIAS_PRESTAMO = 20; // Por ejemplo, 20 días
var FORM_SOLICITUD_ID = '1Qbr5Coww0-4MP-TBpkh2JmMvJe3V9dOZ-gX1oarYPts';
var FORM_DEVOLUCION_ID = '1rxjZBbYxDk1EVGu5HylH4wY3e5E9A4KhxOvLeTpoEyU';
var PESTANIA_LIBROS = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('libros');
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
    }
    
    // Si el formulario es el de devolución
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
    
    // Después de actualizar el estado, actualizar los dropdowns
    actualizarDropdowns();
  }
  
  function actualizarDropdowns() {
    var formSolicitud = FormApp.openById(FORM_SOLICITUD_ID);
    var formDevolucion = FormApp.openById(FORM_DEVOLUCION_ID);  
    var data = PESTANIA_LIBROS.getRange('A2:A10').getValues();
    var status = PESTANIA_LIBROS.getRange('C2:C10').getValues();
  
    var librosLibres = data
      .map(function(item, index) {
        return status[index][0] === ESTADO_LIBRE ? item[0] : null; // Si el estatus es "libre", retornar el elemento
      })
      .filter(Boolean); // Eliminar los valores nulos o no válidos
    
    var librosPrestados = data
      .map(function(item, index) {
        return status[index][0] === ESTADO_PRESTADO ? item[0] : null; // Si el estatus es "prestado", retornar el elemento
      })
      .filter(Boolean); // Eliminar los valores nulos o no válidos
  
  
    var itemsSolicitud = formSolicitud.getItems(FormApp.ItemType.LIST); 
    var dropdownSolicitud = itemsSolicitud[0].asListItem();
    dropdownSolicitud.setChoiceValues(librosLibres);
  
    var itemsDevolucion = formDevolucion.getItems(FormApp.ItemType.LIST); // Ajustar tipo si es dropdown
    var dropdownDevolucion = itemsDevolucion[0].asListItem(); // Ajustar índice según la posición
    dropdownDevolucion.setChoiceValues(librosPrestados);
    
  }
  
