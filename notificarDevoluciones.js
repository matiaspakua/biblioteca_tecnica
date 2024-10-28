const URL_LOGO_KLAGAN = 'https://raw.githubusercontent.com/matiaspakua/tech.notes.io/5236256969f50b8552560ee58f85b2b6187d71df/images/logo_nuevo_klagan.jpg';
const ESTADO_PRESTADO = 'prestado';
const ESTADO_LIBRE = 'libre';
const DIAS_PRIMER_AVISO = 5;
const DIAS_SEGUNDO_AVISO = 2;

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

    if (estadoLibro === ESTADO_PRESTADO) {

      var ultimoPrestamo = buscarUltimoPrestamo(prestamosData, tituloLibro, tituloPrestamosCol);
 
      if (ultimoPrestamo) {

        var correo = ultimoPrestamo[correoPrestamosCol];
        var fechaDevolucion = new Date(ultimoPrestamo[6]);

        // Calcular la diferencia en días entre la fecha de devolución y la fecha actual
        var diasRestantes = Math.ceil((fechaDevolucion - fechaActual) / (1000 * 60 * 60 * 24));

        if (diasRestantes === DIAS_PRIMER_AVISO || diasRestantes === DIAS_SEGUNDO_AVISO) {
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
      break; 
    }
  }
  return ultimoRegistro;
}

function enviarCorreoNotificacion(correo, tituloLibro, diasRestantes) {
  var asunto = "📚 Recordatorio de Devolución: " + tituloLibro;
  var logoUrl = URL_LOGO_KLAGAN;

  var mensajeHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <!-- Cabecera con logo y título -->
        <div style="text-align: center; padding: 10px; background-color: #f7f7f7;">
          <img src="${logoUrl}" alt="Logo de la Empresa" style="width: 150px; margin-bottom: 10px;">
          <h2 style="color: #333;">📅 Recordatorio de Devolución</h2>
        </div>

        <!-- Contenido principal -->
        <div style="padding: 20px;">
          <p>Estimado usuario,</p>
          <p style="font-size: 16px;">
            Este es un recordatorio de que el libro <strong>"${tituloLibro}"</strong> que has tomado prestado 
            está próximo a vencer.
          </p>
          <p style="font-size: 16px; color: #d9534f; font-weight: bold;">
            Faltan ${diasRestantes} día(s) para la fecha de devolución.
          </p>
          <p>Por favor, asegúrate de devolverlo a tiempo.</p>
        </div>

        <!-- Pie de página -->
        <div style="text-align: center; padding: 10px; background-color: #f7f7f7; color: #555;">
          <p>Saludos,</p>
          <p><strong>La Biblioteca</strong></p>
          <p style="font-size: 12px; color: #777;">
            Este mensaje es un recordatorio automático. Por favor, no responder a este correo.
          </p>
        </div>
      </body>
    </html>
  `;
  MailApp.sendEmail({
    to: correo,
    subject: asunto,
    htmlBody: mensajeHtml
  });

}
