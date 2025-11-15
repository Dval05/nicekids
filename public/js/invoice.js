document.addEventListener('DOMContentLoaded', () => {
    const invoiceContent = document.getElementById('invoice-content');
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-EC', options);
    };

    const renderInvoice = (data) => {
        const { payment, student, guardian, company } = data;
        const subtotal = Number(payment.TotalAmount);
        const tax = 0; // Assuming 0% IVA for education
        const total = subtotal + tax;

        invoiceContent.innerHTML = `
            <header class="flex justify-between items-center pb-6 border-b">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800">${company?.CompanyName || 'NiceKids'}</h1>
                    <p class="text-sm text-gray-500">${company?.Address || 'Dirección no configurada'}</p>
                    <p class="text-sm text-gray-500">RUC: ${company?.RUC || 'N/A'}</p>
                </div>
                <div class="text-right">
                    <h2 class="text-2xl font-semibold uppercase text-gray-600">Factura</h2>
                    <p class="text-sm text-gray-500">No. <span class="font-medium text-gray-700">${payment.InvoiceNumber || String(payment.StudentPaymentID).padStart(6, '0')}</span></p>
                    <p class="text-sm text-gray-500">Fecha: <span class="font-medium text-gray-700">${formatDate(payment.PaymentDate || payment.CreatedAt)}</span></p>
                </div>
            </header>
            
            <section class="grid grid-cols-2 gap-8 my-8">
                <div>
                    <h3 class="font-semibold text-gray-700 mb-2">Facturar a:</h3>
                    <p class="font-bold text-gray-800">${guardian.FirstName} ${guardian.LastName}</p>
                    <p class="text-sm text-gray-600">${guardian.Address || 'Sin dirección'}</p>
                    <p class="text-sm text-gray-600">Cédula/RUC: ${guardian.DocumentNumber || 'N/A'}</p>
                    <p class="text-sm text-gray-600">${guardian.Email || ''}</p>
                </div>
                <div class="text-right">
                    <h3 class="font-semibold text-gray-700 mb-2">Estudiante:</h3>
                    <p class="font-bold text-gray-800">${student.FirstName} ${student.LastName}</p>
                    <p class="text-sm text-gray-600">Fecha de Vencimiento: ${formatDate(payment.DueDate)}</p>
                </div>
            </section>

            <section>
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr>
                            <td class="px-4 py-3 text-sm text-gray-700">Servicio Educativo - ${payment.ServiceType}</td>
                            <td class="px-4 py-3 text-right text-sm text-gray-700">$${subtotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="flex justify-end mt-8">
                <div class="w-full max-w-xs">
                    <div class="flex justify-between py-2 border-b">
                        <span class="text-sm text-gray-600">Subtotal:</span>
                        <span class="text-sm font-medium text-gray-800">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b">
                        <span class="text-sm text-gray-600">IVA (0%):</span>
                        <span class="text-sm font-medium text-gray-800">$${tax.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between py-2 bg-gray-100 px-2 rounded">
                        <span class="text-base font-bold text-gray-800">Total a Pagar:</span>
                        <span class="text-base font-bold text-gray-800">$${total.toFixed(2)}</span>
                    </div>
                </div>
            </section>
            
            <footer class="mt-12 pt-6 border-t text-center">
                <p class="text-xs text-gray-500">Autorización SRI: ${company?.SRIAuthorization || 'No configurada'}</p>
                <p class="text-xs text-gray-500">Gracias por su pago.</p>
            </footer>
        `;
    };

    if (paymentId) {
        fetch(`/api/invoices/${paymentId}`)
            .then(res => {
                if (!res.ok) throw new Error('No se pudo cargar la factura.');
                return res.json();
            })
            .then(data => renderInvoice(data))
            .catch(error => {
                invoiceContent.innerHTML = `<p class="p-6 text-center text-red-500">${error.message}</p>`;
            });
    } else {
        invoiceContent.innerHTML = `<p class="p-6 text-center text-red-500">No se proporcionó un ID de pago válido.</p>`;
    }
});