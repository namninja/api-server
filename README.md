# API Server

Welcome to the **API Server** repository! This Node.js API serves mock data for various routes, providing a simple way to test or demonstrate APIs. All data is fake and dynamically generated for testing purposes.

---

## **Features**

This API server provides mock data on the following routes:

- `/users`
- `/comments`
- `/products`
- `/todos`
- `/photos`
- `/albums`
- `/posts`

### **Dynamic Data Feed**

You can filter data dynamically on the `/posts` route by using query parameters. For example:

- To get posts by a specific user:

  ```plaintext
  http://localhost:3000/posts?userId=1
  ```

- `userId` can be any number between `1` and `10`.

---

## **Getting Started**

Follow these steps to set up and run the API server on your local machine.

### **1. Clone the Repository**

Clone this repository to your local system:

```bash
git clone https://github.com/namninja/api-server.git
```

### **2. Install Dependencies**

Navigate into the project directory and install the required dependencies:

```bash
cd api-server
npm install
```

### **3. Run the Node Server**

Start the server with the following command:

```bash
npm start
```

By default, the server runs on `http://localhost:3000`.

---

## **Using the API**

Once the server is running, you can access the mock data by entering the desired route in your browser or using tools like Postman or curl.

### **Example Routes**

- Access the `users` data:

  ```plaintext
  http://localhost:3000/users
  ```

- Access the `comments` data:

  ```plaintext
  http://localhost:3000/comments
  ```

- Access dynamic data on the `posts` route:

  ```plaintext
  http://localhost:3000/posts?userId=2
  ```

---

## **Live Version**

A live version of this Node server is available at:

```plaintext
https://datafeed.reiterablecoffee.com/
```

### **Usage**

The same rules apply as with the local server. Simply append the route to the URL to access the data.

- Example Routes:

  - Products:
    ```plaintext
    https://datafeed.reiterablecoffee.com/products
    ```

  - Posts with Query Parameters:
    ```plaintext
    https://datafeed.reiterablecoffee.com/posts?userId=1
    ```

---

## **Notes**

- All data is fake and provided for testing purposes only.
- The server must be restarted if changes are made to the code.

---

## **License**

This project is open-source and available for personal or educational use. Feel free to modify and adapt it for your needs.
