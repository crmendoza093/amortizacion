document.addEventListener('DOMContentLoaded', function() {
  // Agregar eventos de entrada para dar formato a los campos decimales
  const camposConFormato = ['monto', 'interes'];

  camposConFormato.forEach(campo => {
    document.getElementById(campo).addEventListener('input', function(event) {
      if (campo === 'monto') {
        this.value = formatearNumeroMiles(this.value);
      } else if (campo === 'interes') {
        this.value = formatearNumeroDecimal(this.value);
      }
    });
  });

  document.getElementById('simular').addEventListener('click', simularPrestamo);
  document.getElementById('tipoPlazo').addEventListener('change', actualizarPeriodo);

  // Inicializar DataTable con FixedHeader
  var table = $('#tablaAmortizacion').DataTable({
    columns: [
      { title: '# Cuota' },
      { title: 'Cuota a Pagar' },
      { title: 'Interés' },
      { title: 'Amortización' },
      { title: 'Saldo' }
    ],
    paging: false,
    searching: false,
    scroller: true,
    layout: {
      topStart: {
          buttons: ['excel']
      }
    },
    responsive: true // Hacer la tabla responsive
  });

  new $.fn.dataTable.FixedHeader(table);
});

function formatearNumeroMiles(numero) {
  numero = numero.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
  if (numero.length > 16) numero = numero.slice(0, 16); // Limitar a 16 caracteres
  numero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Agregar separador de miles
  return numero;
}

function formatearNumeroDecimal(numero) {
  numero = numero.replace(/[^0-9,]/g, ''); // Eliminar caracteres no numéricos excepto coma
  if (numero.length > 16) numero = numero.slice(0, 16); // Limitar a 16 caracteres
  if ((numero.match(/,/g) || []).length > 1) numero = numero.replace(/,$/, ''); // Limitar a una coma
  return numero;
}


function simularPrestamo() {
  // Obtener valores del formulario
  const monto = document.getElementById('monto').value.replace(/\./g, '').replace(',', '.');
  const interes = document.getElementById('interes').value.replace(/\./g, '').replace(',', '.');
  const plazoAnios = document.getElementById('plazo').value;

  // Validar campos vacíos o inválidos
  if (!monto || parseFloat(monto) <= 0) {
    alert("Por favor, ingrese un monto válido.");
    return;
  }

  if (!interes || parseFloat(interes) <= 0) {
    alert("Por favor, ingrese una tasa de interés válida.");
    return;
  }

  if (!plazoAnios || parseInt(plazoAnios) <= 0) {
    alert("Por favor, seleccione un plazo válido.");
    return;
  }

  const interesAnual = parseFloat(interes) / 100;
  const tipoPlazo = document.getElementById('tipoPlazo').value;
  
  // Limpiar resultados anteriores
  const tabla = $('#tablaAmortizacion').DataTable(); // Obtener instancia de DataTable
  tabla.clear().draw(); // Limpiar datos existentes en la tabla

  // Calcular cuotas con el tipo de plazo seleccionado
  calcularAmortizacion(parseFloat(monto), parseInt(plazoAnios), interesAnual, tipoPlazo);
}


function calcularAmortizacion(monto, plazoAnios, interesAnual, tipoPlazo) {
  let numeroPagos, tasaInteres;
  if (tipoPlazo === 'mensual') {
    numeroPagos = plazoAnios * 12; // número de pagos mensuales
    tasaInteres = interesAnual / 12; // tasa de interés mensual
  } else {
    numeroPagos = plazoAnios; // número de pagos anuales
    tasaInteres = interesAnual; // tasa de interés anual
  }

  // Calcular cuota usando fórmula de anualidad
  const cuota = (monto * tasaInteres) / (1 - Math.pow(1 + tasaInteres, -numeroPagos));

  let dataSet = [];
  let saldoPendiente = monto;

  for (let i = 1; i <= numeroPagos; i++) {
    const interes = saldoPendiente * tasaInteres;
    const amortizacion = cuota - interes;
    saldoPendiente -= amortizacion;

    dataSet.push([
      i,
      cuota.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      interes.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      amortizacion.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
      saldoPendiente.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    ]);
  }

  // Actualizar la tabla con los nuevos datos
  $('#tablaAmortizacion').DataTable().clear().rows.add(dataSet).draw();
}

function actualizarPeriodo() {
  simularPrestamo(); // Vuelve a simular el préstamo con el nuevo tipo de plazo
}
