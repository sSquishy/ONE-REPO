# 🎓 myPUPQC  

myPUPQC is a web-based platform developed for the **Polytechnic University of the Philippines – Quezon City Campus**. It is designed to support students, faculty, and administrators by streamlining academic tasks, scheduling, and information management.  

---

## 📦 Dependencies Installation  

myPUPQC uses Python dependencies listed in the `requirements.txt` file. This ensures all necessary libraries are installed consistently across different environments.  

### 🔧 Setup Instructions  

1. **Clone this repository**  
   ```bash
   git clone https://github.com/your-username/mypupqc.git
   cd mypupqc
   ```

2. **Create and activate a virtual environment (recommended)**  
   ```bash
   python -m venv venv
   source venv/bin/activate   # On macOS/Linux
   venv\Scripts\activate      # On Windows
   ```

3. **Install dependencies**  
   ```bash
   pip install -r requirements.txt
   ```

---

## 🗄️ Database Setup (PostgreSQL via Render)  

myPUPQC uses a **PostgreSQL database**. The recommended setup uses Render’s free PostgreSQL service.  

### Prerequisites  

- A [Render](https://render.com) account  
- Python installed  
- (Optional) DBeaver or another database manager for visualization  

### ⚙️ Steps to Create and Configure the Database  

1. **Create a Render Account**  
   - Sign up at [render.com](https://render.com)  
   - Log in to the dashboard  

2. **Add a PostgreSQL Service**  
   - On the dashboard, click **Add New → PostgreSQL**  
   - Fill in database details:  
     - **Name**: descriptive name  
     - **Database name**: (recommended)  
     - **User**: descriptive username  
     - **Region**: closest server  
     - **Plan**: Free tier  

3. **Retrieve the Connection URL**  
   - Once created, open your database on Render  
   - Click **Connect → External**  
   - Copy the **External Database URL**  

### 🔗 Connect Database to myPUPQC  

1. Locate your project’s **`.env` file**  
2. Find the `DATABASE_URL` field  
3. Replace its value with the connection URL from Render  

Example:  
```env
DATABASE_URL=postgresql://username:password@host:port/dbname
```

4. Apply database migrations:  
```bash
python manage.py migrate
```

5. (Optional) Verify in DBeaver or another client that tables were created.  

---

## 🚀 Running myPUPQC  

1. Start the development server:  
   ```bash
   python manage.py runserver
   ```

2. Open your browser and go to:  
   ```
   http://127.0.0.1:8000/
   ```

---

## 🔄 Updating Dependencies  

If you add or update packages in your environment, update `requirements.txt`:  

```bash
pip freeze > requirements.txt
```

✅ Always commit the updated `requirements.txt`.  
⚠️ Avoid manually editing it.  

---

## 🤝 Contributing  

This is a **private system**. Contributions are limited to authorized developers only.  
