# GreenGear Agro 🌱

GreenGear is a modern, B2F (Business-to-Farmer) dynamic marketplace connecting fruit farmers directly with agricultural manufacturers. It eliminates middlemen to provide factory prices on fruit nets, organic fertilizers, drip irrigation, seeds, and more.

Built for the modern edge using **TanStack Start**, **React**, and **Cloudflare Workers**. 

## ✨ Features
- **Dynamic Product Catalog**: Pulls live products from MongoDB with a sleek, fast UI.
- **Bilingual Support**: Instant toggle between English and Marathi.
- **Global Shopping Cart**: Multi-item "Amazon-style" cart checkout flow.
- **Role-based Dashboards**: Separate secure dashboards for Farmers (Buyers) and Suppliers (Sellers).
- **Edge Optimized**: Runs securely on Cloudflare Workers for lightning-fast speeds globally.

---

## 🛠️ Tech Stack
- **Framework:** [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview) (React + SSR)
- **Routing:** TanStack Router
- **Database:** MongoDB Atlas (Native Node.js Driver)
- **Styling:** Custom Vanilla CSS & [shadcn/ui](https://ui.shadcn.com/) components
- **Icons:** Lucide React
- **Deployment:** Cloudflare Workers

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Onkar3333/greengrow.git
cd greengrow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
You need a MongoDB Atlas cluster to store users, products, and orders.
1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Get your connection string (under Connect -> Drivers).
3. In the root of the project, duplicate the `.dev.vars.example` file (or create `.dev.vars`) and configure it:

**`.dev.vars`**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=greengear
JWT_SECRET=your-super-secret-local-jwt-key
SUPPORT_PHONE=910000000000
```

### 4. Start the Development Server
```bash
npm run dev
```
Your app will be running at `http://localhost:3000`.

---

## 📦 Deployment to Cloudflare
This project is configured to deploy directly to Cloudflare Workers.

1. Ensure you have the Cloudflare CLI (`wrangler`) authenticated:
```bash
npx wrangler login
```
2. Set your production secrets (you must set `MONGODB_URI` and `JWT_SECRET` in Cloudflare):
```bash
npx wrangler secret put MONGODB_URI
npx wrangler secret put JWT_SECRET
```
3. Deploy the project:
```bash
npm run deploy
```

---

## 📄 License
This project is proprietary and built for GreenGear Agro.
