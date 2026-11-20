# Inventory Management API

This project is for **Web Dev III, Assignment 3**. It is a REST API for a small store inventory, built with Node.js, Express.js, MongoDB, Mongoose and dotenv. There is no frontend; the endpoints are tested with Postman.

Base URL: `http://localhost:5000`

## Tech stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## Features

- Create, read, update and delete products
- Filter by category, search by name or SKU, sort and paginate
- Low-stock report (`quantity <= reorderLevel`)
- Category-wise inventory summary using MongoDB aggregation
- Safe stock increase/decrease (stock cannot go negative)
- Input validation and centralized error handling

`stockValue` is a Mongoose virtual (`price * quantity`), so it is always calculated correctly.

## Folder structure

```text
config/        MongoDB connection
controllers/   API logic
middleware/    validation and error handling
models/        Product schema
routes/        /api/products routes
utils/         sample data, seed script, ApiError
server.js      entry point
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

3. Make sure MongoDB is running. You can use a local install, MongoDB Atlas, or Docker:

```bash
docker run -d --name inventory-mongo -p 27017:27017 mongo:7
```

4. Insert the sample data:

```bash
npm run seed
```

5. Start the server:

```bash
npm run dev
```

The server runs at `http://localhost:5000`. The seed script adds 12 products in 5 categories, and 4 of them are low on stock.

## Environment variables

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
NODE_ENV=development
```

`.env` is not pushed to GitHub. Use `.env.example` to create it.

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/products` | Create a product |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/products/low-stock` | Low-stock report |
| GET | `/api/products/summary` | Category-wise summary |
| PATCH | `/api/products/:id/stock` | Increase or decrease stock |

### Query params for `GET /api/products`

- `category` - filter by category (for example `Furniture`)
- `search` - search in product name or SKU (for example `pen`)
- `sort` - `name`, `sku`, `category`, `price`, `quantity`, `reorderLevel`, `createdAt`, `updatedAt`
- `order` - `asc` or `desc`
- `page` - page number (default `1`)
- `limit` - records per page (default `10`, maximum `100`)

The response looks like this:

```json
{
  "total": 12,
  "page": 1,
  "totalPages": 2,
  "count": 10,
  "products": []
}
```

## Example requests

Create a product:

```http
POST /api/products
Content-Type: application/json
```

```json
{
  "name": "Wireless Mouse",
  "sku": "ELEC-MS-450",
  "category": "Electronics",
  "price": 899,
  "quantity": 30,
  "reorderLevel": 10,
  "supplier": "Logitech India"
}
```

Update stock:

```http
PATCH /api/products/<product-id>/stock
Content-Type: application/json
```

```json
{
  "change": 10
}
```

Use a negative number to decrease stock. If the stock is not enough, the API returns `400`.

## Testing with Postman

Import `postman/Inventory-API.postman_collection.json` and run the requests from top to bottom.

- Create Product returns `201` and saves the new product ID in the `productId` variable.
- Get All Products returns `total: 12`, `page: 1`, `totalPages: 2`, `count: 10`.
- Low-stock returns `count: 4`.
- Summary returns `categories: 5`.
- Stock PATCH returns `{ "message": "Stock updated", "product": {...} }`.
- Delete returns `{ "message": "Product deleted", "id": "..." }`.

## Status codes

- `200` - request successful
- `201` - product created
- `400` - validation error, invalid ID, or not enough stock
- `404` - product not found
- `409` - duplicate SKU
- `500` - server error

## Note

`/low-stock` and `/summary` are declared before `/:id` in the routes file. Otherwise Express would treat them as product IDs.
