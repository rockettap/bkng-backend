export class SellerNotFoundError extends Error {
  constructor(sellerId?: number) {
    super(
      sellerId !== undefined
        ? `Seller with ID ${sellerId} not found.`
        : 'Seller not found.',
    );
    this.name = 'SellerNotFoundError';
  }
}
