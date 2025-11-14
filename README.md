
# Mannova Backend

**Mannova** is a backend system for an **online store**, built with **NestJS**, **TypeScript**, and **PostgreSQL**.  
It provides secure authentication, role-based access, product and category management, shopping cart, and order processing.

---

## Table of Contents
- [Technologies](#technologies)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Cart & Orders Workflow](#cart--orders-workflow)
- [Error Handling & Validation](#error-handling--validation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Technologies
- **NestJS** – Node.js framework for scalable server-side apps  
- **TypeScript** – Strongly typed language  
- **PostgreSQL** – Relational database  
- **TypeORM** – ORM for database operations  
- JWT Authentication  
- bcrypt – Password hashing  
- Validation & Error Handling  

---

## Features
- User registration and login  
- Role-based access control (**Admin / User**)  
- Product management (CRUD)  
- Category management (CRUD)  
- Shopping cart management  
- Order creation and tracking  
- JWT-based authentication  
- Swagger/OpenAPI documentation  

---

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/Abdelrahman-Yaser/elzero-backend.git
cd elzero-backend
````

2. Install dependencies:

```bash
npm install
```

3. Set up PostgreSQL database:

* Create a database, e.g., `mannova_db`
* Update `.env` with your credentials

4. Run the application:

```bash
npm run start:dev
```

5. API is available at:

```
http://localhost:3000
```

6. Swagger documentation (if enabled):

```
http://localhost:3000/api
```

---

## Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=mannova_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s
```

---

## API Endpoints

### Authentication

* **POST /auth/register** – Register a new user
* **POST /auth/login** – Login and receive JWT
* **POST /auth/forgot-password** – Request password reset
* **POST /auth/reset-password** – Reset password

#### Example JSON

```json
// Register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Login Response
{
  "access_token": "jwt_token_here"
}
```

---

### Products

* **GET /products** – List all products
* **GET /products/:id** – Get product by ID
* **POST /products** – Add product (Admin only)
* **PUT /products/:id** – Update product (Admin only)
* **DELETE /products/:id** – Delete product (Admin only)

#### Example Product JSON

```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-end gaming laptop",
  "price": 1500,
  "categoryId": 2
}
```

---

### Categories

* **GET /categories** – List all categories
* **POST /categories** – Add category (Admin only)

#### Example Category JSON

```json
{
  "id": 2,
  "name": "Electronics"
}
```

---

### Cart

* **POST /cart/add** – Add product to cart
* **GET /cart** – View cart
* **DELETE /cart/:itemId** – Remove item from cart

#### Example Cart JSON

```json
{
  "productId": 1,
  "quantity": 2
}
```

---

### Orders

* **POST /orders** – Create order from cart
* **GET /orders** – List user orders
* **GET /orders/:id** – Get order details

#### Example Order JSON

```json
{
  "id": 1,
  "userId": 1,
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "total": 3000,
  "status": "pending"
}
```

---

## Cart & Orders Workflow

1. **Add products to cart**
2. **View cart** – Users can see items and quantities
3. **Create order** – Converts all cart items into an order
4. **Order status**:

   * `pending` – Newly created
   * `processing` – Payment verified
   * `completed` – Order shipped
   * `cancelled` – Order cancelled by user/admin

> Only **Admin** can update products, categories, or view all orders/users. Users can only access their own cart and orders.

---

## Error Handling & Validation

* **Validation Errors** – 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["name must be a string", "price must be a number"],
  "error": "Bad Request"
}
```

* **Unauthorized Access** – 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

* **Forbidden Action** – 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

---

## Testing

Run unit and e2e tests:

```bash
npm run test
npm run test:e2e
```

---

## Contributing

1. Fork the project
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to your branch: `git push origin feature-name`
5. Open a Pull Request

---



