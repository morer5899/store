# `$$$ Prerequisites $$$`
Before setting up the project, ensure you have the following installed on your system:

Node.js (v14 or higher)

MySQL (v8 recommended)

npm or yarn package manager

Git

# `$$$ Step-by-Step SERVER Setup Guide $$$`

# 1. `Clone the Repository bash`
git clone https://github.com/morer5899/store.git
cd store

# 2. `Install Dependencies bash`
cd server/npm install
cd client/npm install

# or
cd server/npm install
cd client/npm install
This will install all required packages including:


# 3. `Database Setup`

1. `Configure Database Connection`
Navigate to server/src/config/config.json

Update the development configuration:

json
{
  "development": {
    "username": "root",
    "password": "your_mysql_password",
    "database": "your_database_name",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

2. `Create Database`
Open terminal  and create a new database:
/server/npm install --save-dev sequelize-cli
/server/src/ npx sequelize db:create


# 4. `Environment Variables`
Create a server/.env file in the root directory:
.env
PORT=8000
JWT_SECRET=your_super_secret_jwt_key_change_this


# 5. `Run Database Migrations`
Create the database tables:


/server/src/npx sequelize-cli db:migrate
This will create the following tables:

users - User accounts and authentication

stores - Store information

ratings - User ratings for stores

# 6. Start the Server
Development Mode (with auto-reload):

/server/npm run dev


# `$$$ Step-by-Step CLIENT Setup Guide $$$`

# 1. `Install Dependencies bash`
cd client/npm install

# 2. `Environment Variables`
Create a client/.env file in the root directory:
.env
VITE_API_URL=http://localhost:8000/api/v1

# 3. `Start the Development Server`

/client/npm run dev
# or
/client/yarn dev
