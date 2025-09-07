import Invoice from '../models/invoice.model.js';
export const createInvoice = async (invoiceData) => {
    const invoice = await Invoice.create(invoiceData);
    return invoice;
};
//# sourceMappingURL=invoice.service.js.map