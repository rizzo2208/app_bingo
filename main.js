document.getElementById('bingoForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!cartonesValidos) {
        alert("Por favor corrija la lista de cartones. No pueden ser 0, ni estar duplicados o ya vendidos.");
        return;
    }

    const formaPago = document.getElementById('formaPago').value;
    const precioUnitario = parseFloat(document.getElementById('precioUnitario').value) || 0;
    const totalVenta = cartonesSeleccionados.length * precioUnitario;

    let montoEfectivo = 0;
    let montoTransferencia = 0;

    if (formaPago === 'efectivo') {
        montoEfectivo = totalVenta;
    } else if (formaPago === 'transferencia') {
        montoTransferencia = totalVenta;
    } else {
        montoEfectivo = parseFloat(document.getElementById('montoEfectivo').value) || 0;
        montoTransferencia = parseFloat(document.getElementById('montoTransferencia').value) || 0;

        if (Math.abs((montoEfectivo + montoTransferencia) - totalVenta) > 0.01) {
            alert("Error: En el pago mixto, la suma de Efectivo y Transferencia debe ser exactamente igual al Total.");
            return;
        }
    }

    const payload = {
        fecha: new Date().toLocaleString('es-AR'),
        vendedor: document.getElementById('vendedor').value.trim(),
        comprador: document.getElementById('comprador').value.trim(),
        cartones: [...cartonesSeleccionados].sort((a, b) => a - b),
        cantidad: cartonesSeleccionados.length,
        precioUnitario: precioUnitario,
        formaPago: formaPago,
        montoEfectivo: montoEfectivo,
        montoTransferencia: montoTransferencia,
        total: totalVenta
    };

    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Registrando...</span>`;

    // CONDICIÓN CORREGIDA: Si la URL existe y no está vacía, dispara la petición HTTP
    if (SCRIPT_URL && SCRIPT_URL.trim() !== '') {
        try {
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.warn("Error enviando datos a Apps Script:", err);
        }
    }

    dbVentas.push(payload);
    payload.cartones.forEach(n => cartonesVendidosGlobal.add(n));

    mostrarUltimaVenta(payload);
    actualizarTotalesGlobales();

    document.getElementById('comprador').value = '';
    document.getElementById('cartonDesde').value = '';
    document.getElementById('cartonHasta').value = '';
    document.getElementById('cartonesLista').value = '';
    procesarCartones();

    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<i class="fa-solid fa-check-circle"></i> <span>Confirmar y Registrar Venta</span>`;
});