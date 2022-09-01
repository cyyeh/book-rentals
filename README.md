# Book Rentals

access the application here: https://book-rentals-e135d.web.app/

- admin account
  - email: `demo-admin@gmail.com`
  - password: `P@ssw0rd`
- user account
  - email: `demo-user@gmail.com`
  - password: `P@ssw0rd`

## How to run the software

- setup firebase
  - setup a firebase project and fill in credentials within `.env` after executing `cp .env.example .env`
  - setup firebase authentication
    - email/password
  - setup firebase firestore
  - setup [firebase hosting](https://medium.com/swlh/how-to-deploy-a-react-app-with-firebase-hosting-98063c5bf425)
    - `npm install -g firebase-tools`
      - `firebase login`
      - `firebase init`
- local development
  - `yarn install`
  - `yarn dev`
  - e2e testing(`yarn dev` should be executed at the same time)
    - `yarn cypress`
- to deploy the software
  - `yarn build`
  - `yarn deploy`

## Requirements

- Write an application to manage book rentals:
  - The application must be React-based.
  - Include at least 2 user roles: Manager and User.
  - Users must be able to create an account and log in.
  - Each book will have the following information in the profile:
    - Name.
    - Author.
    - ISBN.
    - Url.
    - Rating.
    - A checkbox indicating if the book is available for rental or not.
- Managers can:
  - Create, Read, Edit, and Delete Books.
  - Create, Read, Edit, and Delete Users and Managers.
  - See all the users who reserved a book, and the period of time they did it.
  - See all the books reserved by a user and the period of time they did it.
- Users can:
  - See a list of all available books for some specific dates.
  - Filter by name, author, ISBN or rate averages.
  - Reserve a book for a specific period of time.
  - Rate the book with a score of 1 to 5.
  - Cancel a reservation.

## TODOs

- Frontend
  - Routing
    - [x] Authentication page(`/login`)
    - [x] Home page(`/`)
    - [x] Management portal page(`/admin`)
    - [x] Not found page(`/*`)
  - Authentication
    - [x] Sign up/Sign in
    - [x] Email/password authentication
  - Home page
    - [x] See a list of all available books for some specific dates
    - [x] Filter books by name, author, ISBN, or rate averages
    - [x] Reserve a book for a specific period of time
    - [x] Rate the books with a score of 1 to 5
    - [x] Cancel a reservation
  - Management portal
    - [x] CRUD for books
      - [x] create books
      - [x] read books
      - [x] edit books
      - [x] delete books
    - [x] CRUD for users
      - [x] create users
      - [x] read users
      - [x] edit users
      - [x] delete users
    - [x] See all the users who reserved a book, and the period of time they did it
    - [x] See all the books reserved by a user and the period of time they did it
- Backend
  - Firebase
    - [x] Setup Firebase
      - [x] Authentication
      - [x] Firestore
      - [x] hosting
  - Data modeling
    - [x] users
    - [x] books
    - [x] rentals
  - APIs
    - [x] users
      - [x] create user
      - [x] get users
      - [x] get user
      - [x] update user
      - [x] delete user
    - [x] books
      - [x] create book
      - [x] get books
      - [x] get book
      - [x] update book
      - [x] delete book
    - [x] rentals
      - [x] get available books
      - [x] make book reservation
      - [x] cancel book reservation
      - [x] finish book reservation
      - [x] get book reservations
      - [x] rate book history reservation

## Design Decisions

- Use Firebase
  - Authentication
    - Google
    - Firebase UI
  - Firestore database
    - users
      - id(automatically generated)
      - email
      - name
      - role
        - manager, user
    - books
      - id(automatically generated)
      - author(string)
      - name(string)
      - ISBN(string)
      - url(string)
      - averageRating(number)
    - rentals
      - id(automatically generated)
      - book_id(string)
      - user_id(string)
      - start_time(timestamp)
        - date, ex: 20220812
      - end_time(timestamp)
        - - date, ex: 20220814
      - status(string)
        - reserved, cancelled(if cancel date is before start_time)
      - rating(number)
        - user can only rate if the reservation is not cancelled and finished(endTime was dued)
