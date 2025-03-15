# Simple Twitter API

A fully functional **RESTful API** for a Twitter-like social platform, built with **Node.js, Express, and MySQL**.

✨ **Features**:
- User authentication with **JWT**
- **CRUD** operations for posts, comments, and likes
- Follow/unfollow system
- **WebSocket** for real-time chat
- API documentation with **Swagger**

you can use the following account to login:

```
Admin
Account: root
Password: 123456789

User
Account: user1
Password: 123456789
```

## API Guideline

Please refer to [API Docs](https://grateful-apparatus-3b9.notion.site/API-simple-twitter-1afc9d64a77580d7b8f8ef81fed25969?pvs=4) for more details.

#### Admin related

#### `GET /admin/users`

- **Description**

    Get all users data including their social activeness

- **Response**

    - 200:Successfully retrieved an array of user objects
```
[
    {
        "id": 3,
        "name": "user2",
        "account": "user2",
        "profilePic": "/image/profilePic.png",
        "cover": "/image/cover.png",
        "postCount": 50,
        "likeCount": 0,
        "followersCount": 1,
        "followingsCount": 0
    }
]
```
    - 401:Access token is invalid

#### `DELETE /admin/posts/:id`

- **Description**

    - Delete a post by its id
- **Parameter**

    - id: The id of the post you want to delete
- **Response**

    - 200:Successfully deleted a post
```
{
    "status": "success",
    "message": "Post deleted successfully"
}
```

    - 401:Access token is invalid

#### User related

#### `POST /users/signin`

- **Description**

    - login to user's account
- **Request Body**

    - account: The user's account
    - password: The user's password
- **Response**

    - 200:Successfully logged in to user's account
```
{
    "status": "success",
    "message": "User logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQwOTcyMjcwfQ.2YcXmB-adCjldYHOzvrYu34DXyA_nJThtMItjy8zHcQ",
    "user": {
        "id": 2,
        "name": "user1",
        "email": "user1@example.com",
        "account": "user1",
        "profilePic": "/image/profilePic.png",
        "introduction": "Minus trepide vesco repudiandae abutor. Agnitio ad",
        "cover": "/image/cover.png",
        "role": "user"
    }
}
```

    - 401:Password is incorrect
```
{
    "status": "error",
    "message": "Invalid credentials"
}
```

    - 404:User not found
```
{
    "status": "error",
    "message": "User not found"
}
```

    - 400:required parameters
```
{
    "status": "error",
    "message": "account and password are required"
}
```

#### `POST /users/signup`

- **Description**

    - create a new user
- **Request Body**

    - account
    - name
    - email
    - password
    - checkPassword
- **Response**

    - 200:Successfully create a account
```
{
    "status": "success",
    "message": "test1 register successfully! Please login."
}
```

    - 400:User already exists.
```
{
    "status": "error",
    "message": "A user already exists. Choose a different account or email."
}
```

    - 400:Did not fill out all fields
```
{
    "status": "error",
    "errors": [
        {
            "message": "Please fill out all fields."
        },
        {
            "message": "Password and checkPassword do not match."
        }
    ],
    "userInput": {
        "account": "test1",
        "name": "test1",
        "email": "test1@example.com",
        "password": "123456789",
        "checkPassword": ""
    }
}
```

#### `GET /users/top`

- **Description**
  
    - get 10 users of the top following
- **Response**

    - 200:Successfully get 10 users of the top following
```
[
    {
        "id": 3,
        "name": "user2",
        "account": "user2",
        "profilePic": "/image/profilePic.png",
        "followerCount": 1,
        "isFollowed": true
    },
    {
        "id": 4,
        "name": "user3",
        "account": "user3",
        "profilePic": "/image/profilePic.png",
        "followerCount": 0,
        "isFollowed": false
    },
]
```

    - 401:Access token is missing or invalid

#### `GET /users/current_user`

- **Description**

    - get the current login user data
- **Response**

    - 200: Successfully get the current user data
```
{
    "id": 2,
    "name": "user1",
    "email": "user1@example.com",
    "account": "user1",
    "profilePic": "/image/profilePic.png",
    "introduction": "Minus trepide vesco repudiandae abutor. Agnitio ad",
    "cover": "/image/cover.png",
    "role": "user"
}
```

    - 401:Access token is missing or invalid

#### `GET /users/:id`

- **Description**

    - get user data by id

- **Parameter**

    - id: The id of the user
- **Response**

    - 200: Successfully get the user data 
```
{
    "id": 2,
    "name": "user1",
    "email": "user1@example.com",
    "account": "user1",
    "profilePic": "/image/profilePic.png",
    "introduction": "Minus trepide vesco repudiandae abutor. Agnitio ad",
    "cover": "/image/cover.png",
    "role": "user",
    "postCount": 10,
    "followerCount": 0,
    "followingCount": 1,
    "isFollowed": false
}
```

    - 401:Access token is missing or invalid

#### `PUT /users/:id`

- **Description**

    - Edit the profile or set the data
- **Parameter**

    - id: The id of the user
- **Request Body**
  
    - account
    - name
    - email
    - password
    - profilePic
    - cover
    - introduction
- **Response**

    - 200:Successfully update user's personal data
```
{
    "status": "success",
    "message": "User profile has been successfully updated."
}
```

    - 403:You can not edit other's profile
```
{
    "status": "error",
    "message": "You can not edit other's profile"
}
```


#### `GET /users/:id/Posts`

- **Description**

    - get the posts by user id

- **Parameter**

    - id: The id of the users

- **Response**

    - 200: Retrieved an array of post objects
```
[
    {
        "id": 51,
        "content": "It's a good day",
        "createdAt": "2025-02-23T10:56:35.000Z",
        "likesCount": 0,
        "commentsCount": 0,
        "isLiked": false
    },
]
```

    - 401: Access token is missing or invalid

    - 404: User not found
```
{
    "status": "error",
    "message": "User not found"
}
```

#### `GET /users/:id/likes`

- **Description**

    - get the likes by user id

- **Parameter**

    - id: The id of the user

- **Response**

    - 200: Retrieved an array of post objects
```
[
    {
        "id": 3,
        "createdAt": "2025-03-03T17:41:06.000Z",
        "postId": 2,
        "post": {
            "id": 2,
            "content": "Commodo correptius video amor amplexus surgo damnatio theca decimus.",
            "createdAt": "2025-02-14T05:50:04.000Z",
            "isLiked": true,
            "User": {
                "id": 3,
                "account": "user2",
                "name": "user2",
                "profilePic": "/image/profilePic.png"
            },
            "commentsCount": 4,
            "likesCount": 1
        }
    }
]
```

    - 401: Access token is missing or invalid

    - 404: User not found
```
{
    "status": "error",
    "message": "User not found"
}
```

#### `GET /users/:id/commented_posts`

- **Description**

    - get the posts a specific user replied by user id

- **Parameter**

    - id: the id of the user

- **Response**

    - 200: Retrieved an array of post objects
```
[
    {
        "id": 152,
        "createdAt": "2025-02-24T09:15:54.000Z",
        "postId": 2,
        "post": {
            "id": 2,
            "content": "Commodo correptius video amor amplexus surgo damnatio theca decimus.",
            "createdAt": "2025-02-14T05:50:04.000Z",
            "isLiked": true,
            "User": {
                "id": 3,
                "account": "user2",
                "name": "user2",
                "profilePic": "/image/profilePic.png"
            },
            "commentsCount": 4,
            "likesCount": 1
        }
    }
]
```

  - 401: Access token is missing or invalid


  - 404: User not found
```
{
    "status": "error",
    "message": "User not found"
}
```

#### `GET /users/:id/followers`

- **Description**

    - get the followers user data

- **Parameter**

    - id: the user of the followers

- **Response**

    - 200: Successfully get the followers user data
```
[
    {
        "followerId": 4,
        "name": "user3",
        "account": "user3",
        "profilePic": "/image/profilePic.png",
        "isFollowed": true
    }
]
```

  - 401: Access token is missing or invalid

  - 404: User not found

```
{
    "status": "error",
    "message": "User not found"
}
```

#### `GET /users/:id/followings`

- **Description**

    - get the following user data

- **Parameter**

    - id: the user of the following

- **Response**

    - 200: Successfully get the following user data
```
[
    {
        "followingId": 2,
        "name": "user1",
        "account": "user1",
        "profilePic": "/image/profilePic.png",
        "isFollowed": true
    },
    {
        "followingId": 3,
        "name": "user2",
        "account": "user2",
        "profilePic": "/image/profilePic.png",
        "isFollowed": true
    }
]
```

  - 401: Access token is missing or invalid

  - 404: User not found
```
{
    "status": "error",
    "message": "User not found"
}
```

#### `POST /users/:id/follow`

- **Description**

    - follow a user by id
- **Parameter**

    - id: the id of the user
- **Response**

    - 200: Successfully followed the user
```
{
    "status": "success",
    "message": "followed @user3",
    "followingUser": {
        "id": 4,
        "name": "user3",
        "email": "user3@example.com",
        "password": "$2a$10$0uTNeZU7D16lt5HKEw3GbOEFyGg/7uCoK8MvvBDpJ2xMW.UIAbVgq",
        "gender": "female",
        "birthdate": "1996-04-15",
        "account": "user3",
        "role": "user",
        "profilePic": "/image/profilePic.png",
        "cover": "/image/cover.png",
        "introduction": "Nostrum ager placeat. Surgo calco volubilis. Adsid",
        "createdAt": "2025-02-14T02:13:19.000Z",
        "updatedAt": "2025-02-14T02:13:19.000Z"
    }
}
```
    - 403:Cannot follow yourself

```
{
    "status": "error",
    "message": "You cannot follow yourself."
}
```

#### `DELETE /users/:id/unfollow`

- **Description**

    - cancel to follow the following user
- **Parameter**
    - id: the id of the following user
- **Response**

    - 200: Successfully unfollow the following user
```
{
    "status": "success",
    "message": "Successfully unfollowed user2"
}
```
    - 403: Cannot unfollow yourself
```
{
    "status": "error",
    "message": "You cannot unfollow yourself."
}
```

## Install Simple Twitter API

By following the instruction, you can run a Simple Twitter API server on your local machine.

### Prerequisites

- Git
- Node.js v18.15.0
- MySQL 8.0.15
- MySQL WorkBench 8.0.15

### Clone the repository to your local machine

To properly use the app and login feature, make sure you have filled out the following information in .env file.

```
$ git clone https://github.com/Tim2319/simple-twitter-backend.git
```

### Install project dependencies

```
$ cd twitter-api
$ npm install
```

### 🔐 Environment Variables (.env file)
Create a `.env` file in the root directory and fill in the following:

```
DB_HOST = <your_DB_HOST>
DB_USER = <your_DB_USER>
DB_PASSWORD = <your_DB_PASSWORD>
DB_NAME = <your_DB_NAME>
DB_DIALECT = <your_DB_DIALECT>
PORT = <your_PORT>
JWT_SECRET = <your_jwt_secret>
PUBLIC_ROOM_ID = <your_PUBLIC_ROOM_ID>
```

### Use Sequelize CLI to create tables in database

```
$ npx sequelize db:migrate
$ NODE_ENV = test
$ npx sequelize db:migrate
```

### Import seed data

```
$ NODE_ENV = development
$ npx sequelize db:seed:all
```

### Run test

```
$ NODE_ENV = test
$ npm run test
```

### Start the server & check if the following message shows

```
$ npm run dev
http://localhost:3000
```