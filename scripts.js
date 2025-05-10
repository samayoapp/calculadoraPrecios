alert("Hola, estas en modo exporación.");

function calcularPrecio() {
    // Ocultar resultados y errores previos
    document.getElementById('resultadoDiv').style.display = 'none';
    document.getElementById('errorDiv').style.display = 'none';
    document.getElementById('errorDiv').innerText = '';

    // Obtener los valores de los inputs
    const costoServicio = parseFloat(document.getElementById('costoServicio').value);
    const porcentajeComision = parseFloat(document.querySelector('input[name="comision"]:checked').value);
    const costosIndirectos = parseFloat(document.getElementById('costosIndirectos').value);
    const margenBrutoDeseado = parseFloat(document.getElementById('margenBrutoDeseado').value); // Input clave cambiado

    // --- Validación de Entradas ---
    if (isNaN(costoServicio) || costoServicio < 0 ||
        isNaN(porcentajeComision) || porcentajeComision < 0 ||
        isNaN(costosIndirectos) || costosIndirectos < 0 ||
        isNaN(margenBrutoDeseado)) {
        document.getElementById('errorDiv').innerText = 'Por favor, ingresa valores numéricos válidos y positivos (excepto Margen Bruto que puede ser 0 o negativo teóricamente) en todos los campos.';
        document.getElementById('errorDiv').style.display = 'block';
        return;
    }

    if (margenBrutoDeseado >= 100) {
        document.getElementById('errorDiv').innerText = 'El Margen Bruto Deseado debe ser menor que 100%. Un margen del 100% o más no es práctico para este cálculo (requiere Costo cero o precio infinito).';
        document.getElementById('errorDiv').style.display = 'block';
        // Limpiar campos de resultado podría ser buena idea aquí o mostrar N/A
        document.getElementById('cogsCalculado').innerText = "N/A";
        document.getElementById('precioVentaCalculado').innerText = "N/A";
        document.getElementById('gananciaBrutaCalculada').innerText = "N/A";
        document.getElementById('markupSobreCostoCalculado').innerText = "N/A";
        const margenBrutoObtenidoElem = document.getElementById('margenBrutoObtenido');
        if (margenBrutoObtenidoElem) margenBrutoObtenidoElem.innerText = "N/A";
        document.getElementById('resultadoDiv').style.display = 'block'; // Mostrar el div con N/A
        return;
    }

    // --- Cálculos Principales ---
    // 1. Valor de la comisión (parte del COGS)
    const valorComisionCalculada = costoServicio * (porcentajeComision / 100);

    // 2. Costo de Bienes Vendidos (COGS) por unidad
    const cogsUnitario = costoServicio + valorComisionCalculada + costosIndirectos;

    let precioVenta = 0;
    let gananciaBruta = 0;
    let markupSobreCosto = 0;
    let margenBrutoObtenidoReal = 0;

    // Manejo especial si COGS es 0
    if (cogsUnitario === 0) {
        if (margenBrutoDeseado === 0) {
            precioVenta = 0;
            gananciaBruta = 0;
            markupSobreCosto = 0; // O "N/A" si se prefiere
            margenBrutoObtenidoReal = 0; // O "N/A"
        } else {
            // Si COGS es 0, cualquier precio > 0 da 100% de Margen Bruto.
            // Un Margen Bruto específico < 100% y > 0% no se puede "fijar" con COGS=0
            // mediante la fórmula PV = COGS / (1 - GM_target / 100), pues daría PV=0.
            document.getElementById('errorDiv').innerText = 'El costo no puede ser cero si se desea un margen bruto diferente de cero. Por favor, revisa los valores ingresados.';
            document.getElementById('errorDiv').style.display = 'block';
            // Se mostrarán los valores calculados como 0 o N/A
            precioVenta = 0; // Dado que la fórmula PV = COGS / (1-GM%) da 0
            gananciaBruta = 0;
            markupSobreCosto = "N/A"; // (0/0) es indefinido, o infinito si PV > 0
            margenBrutoObtenidoReal = (precioVenta > 0) ? 100 : 0; // Si forzamos PV=0, GM=0
        }
    } else {
        // 3. Calcular el Precio de Venta Sugerido (PV)
        const denominadorPV = 1 - (margenBrutoDeseado / 100);
        if (denominadorPV <= 0) { // GM >= 100%, ya cubierto arriba, pero doble chequeo.
            document.getElementById('errorDiv').innerText = 'Error: Margen bruto llevaría a un precio inválido (denominador cero o negativo).';
            document.getElementById('errorDiv').style.display = 'block';
            return; // Salir para evitar NaN/Infinity descontrolado si el primer if no lo atrapa
        }
        precioVenta = cogsUnitario / denominadorPV;

        // 4. Calcular la Ganancia Bruta (GP)
        gananciaBruta = precioVenta - cogsUnitario;

        // 5. Calcular el Porcentaje de Markup sobre COGS necesario (PM_costo)
        if (cogsUnitario > 0) { // COGS es positivo
            markupSobreCosto = (gananciaBruta / cogsUnitario) * 100;
        } else { // Este 'else' no debería alcanzarse si cogsUnitario === 0 se manejó arriba
            markupSobreCosto = "N/A";
        }
    }
    
    // Calcular el margen bruto obtenido real para verificación
    if (precioVenta > 0) {
        margenBrutoObtenidoReal = (gananciaBruta / precioVenta) * 100;
    } else if (precioVenta === 0 && cogsUnitario === 0) { // Si PV y COGS son 0
        margenBrutoObtenidoReal = 0; // Definir como 0 o N/A
    } else if (precioVenta === 0 && cogsUnitario > 0) { // Venta a 0 con costo > 0
        margenBrutoObtenidoReal = -Infinity; // Margen negativo infinito
    } else { // Otros casos, podría ser NaN si PV es 0 y GP es 0
        margenBrutoObtenidoReal = 0; // O N/A
    }


    // --- Mostrar Resultados ---
    document.getElementById('cogsCalculado').innerText = cogsUnitario.toFixed(2);
    document.getElementById('precioVentaCalculado').innerText = isFinite(precioVenta) ? precioVenta.toFixed(2) : "N/A";
    document.getElementById('gananciaBrutaCalculada').innerText = isFinite(gananciaBruta) ? gananciaBruta.toFixed(2) : "N/A";
    document.getElementById('markupSobreCostoCalculado').innerText = isFinite(markupSobreCosto) ? markupSobreCosto.toFixed(2) : (markupSobreCosto === Infinity ? "Infinito" : "N/A");
    
    const margenBrutoObtenidoElem = document.getElementById('margenBrutoObtenido');
    if (margenBrutoObtenidoElem) {
        if (isFinite(margenBrutoObtenidoReal)) {
            margenBrutoObtenidoElem.innerText = margenBrutoObtenidoReal.toFixed(2);
        } else if (margenBrutoObtenidoReal === -Infinity) {
            margenBrutoObtenidoElem.innerText = "-Infinito";
        }
         else {
            margenBrutoObtenidoElem.innerText = "N/A";
        }
    }
    
    // Obtener el porcentaje de impuesto seleccionado
    const impuestoRadios = document.getElementsByName('impuesto');
    let porcentajeImpuesto = 0;
    for (const radio of impuestoRadios) {
        if (radio.checked) {
            porcentajeImpuesto = parseFloat(radio.value);
            break;
        }
    }

    // Calcular el precio con impuesto
    const precioMasImpuesto = precioVenta * (1 + porcentajeImpuesto / 100);

    // Mostrar el precio con impuesto en el resultado
    document.getElementById('precioSugeridoConImpuesto').textContent = precioMasImpuesto.toFixed(2);

    // Calcular el impuesto aplicado
    const impuestoAplicado = precioVenta * (porcentajeImpuesto / 100);

    // Mostrar el impuesto aplicado en el resultado
    const impuestoAplicadoElem = document.getElementById('impuestoAplicado');
    if (impuestoAplicadoElem) {
        impuestoAplicadoElem.textContent = impuestoAplicado.toFixed(2);
    }

    document.getElementById('resultadoDiv').style.display = 'block';
}

// Formatear números con separador de miles
function formatNumberWithCommas(number) {
    return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
